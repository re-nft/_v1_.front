import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { request } from "graphql-request";

import {
  CurrentAddressContext,
  RentNftContext,
  SignerContext,
} from "../../hardhat/SymfoniContext";
import { ERC721 } from "../../hardhat/typechain/ERC721";
import { ERC1155 } from "../../hardhat/typechain/ERC1155";
import { getERC1155, getERC721, THROWS, timeItAsync } from "../../utils";
import { usePoller } from "../../hooks/usePoller";
import {
  SECOND_IN_MILLISECONDS,
  RENFT_SUBGRAPH_ID_SEPARATOR,
} from "../../consts";
import { parseLending, parseRenting } from "./utils";

import { Address } from "../../types";
import {
  queryUserRenft,
  queryAllRenft,
  queryUserLendingRenft,
  queryUserRentingRenft,
  queryMyERC721s,
  queryMyERC1155s,
} from "./queries";
import {
  NftRaw,
  ERC1155s,
  ERC721s,
  NftToken,
  LendingRaw,
  RentingRaw,
} from "./types";
import { Nft, Lending, Renting } from "./classes";
import useFetchNftDev from "./hooks/useFetchNftDev";
// // * only in dev env
// import useFetchNftDev from "./hooks/useFetchNftDev";

/**
 * Useful links
 * https://api.thegraph.com/subgraphs/name/wighawag/eip721-subgraph
 * https://api.thegraph.com/subgraphs/name/amxx/eip1155-subgraph
 * https://github.com/0xsequence/token-directory
 *
 * Kudos to
 * Luis: https://github.com/microchipgnu
 * Solidity God: wighawag
 */

const IS_PROD =
  process.env["REACT_APP_ENVIRONMENT"]?.toLowerCase() === "production";

// renft localhost and prod subgraph for pulling NFTs related to reNFT
const ENDPOINT_RENFT_PROD =
  "https://api.thegraph.com/subgraphs/name/nazariyv/rentnft";
const ENDPOINT_RENFT_DEV =
  "http://localhost:8000/subgraphs/name/nazariyv/ReNFT";

// non-reNFT prod subgraphs for pulling your NFT balances
const ENDPOINT_EIP721_PROD =
  "https://api.thegraph.com/subgraphs/name/wighawag/eip721-subgraph";
const ENDPOINT_EIP1155_PROD =
  "https://api.thegraph.com/subgraphs/name/amxx/eip1155-subgraph";

type RenftsLending = {
  [key: string]: Lending;
};

type RenftsRenting = {
  [key: string]: Renting;
};

type LendingId = string;
type RentingId = LendingId;

type GraphContextType = {
  renftsLending: RenftsLending;
  renftsRenting: RenftsRenting;
  usersNfts: Nft[];
  usersLending: Lending[];
  usersRenting: Renting[];
};

const DefaultGraphContext: GraphContextType = {
  renftsLending: {},
  renftsRenting: {},
  usersNfts: [],
  usersLending: [],
  usersRenting: [],
};

enum FetchType {
  ERC721,
  ERC1155,
}

const GraphContext = createContext<GraphContextType>(DefaultGraphContext);

export const GraphProvider: React.FC = ({ children }) => {
  const [currentAddress] = useContext(CurrentAddressContext);
  const [signer] = useContext(SignerContext);
  const { instance: renft } = useContext(RentNftContext);

  const [renftsLending, setRenftsLending] = useState<RenftsLending>(
    DefaultGraphContext["renftsLending"]
  );
  const [renftsRenting, setRenftsRenting] = useState<RenftsRenting>(
    DefaultGraphContext["renftsRenting"]
  );
  const [usersNfts, setUsersNfts] = useState<Nft[]>(
    DefaultGraphContext["usersNfts"]
  );
  const [_usersLending, _setUsersLending] = useState<LendingId[]>([]);
  const [_usersRenting, _setUsersRenting] = useState<RentingId[]>([]);

  const fetchNftDev = useFetchNftDev(signer);

  const fetchUserProd = useCallback(
    async (fetchType: FetchType) => {
      let query = "";
      let subgraphURI = "";

      switch (fetchType) {
        case FetchType.ERC721:
          query = queryMyERC721s(currentAddress);
          subgraphURI = ENDPOINT_EIP721_PROD;
          break;
        case FetchType.ERC1155:
          query = queryMyERC1155s(currentAddress);
          subgraphURI = ENDPOINT_EIP1155_PROD;
          break;
      }

      const response: ERC721s | ERC1155s = await timeItAsync(
        `Pulled My ${FetchType[fetchType]} NFTs`,
        async () => await request(subgraphURI, query)
      );

      let tokens: NftToken[] = [];
      switch (fetchType) {
        case FetchType.ERC721:
          tokens = (response as ERC721s).tokens.map((t) => {
            // ! in the case of ERC721 the raw tokenId is in fact `${nftAddress}_${tokenId}`
            const [address, tokenId] = t.id.split("_");
            return { address, tokenId, tokenURI: t.tokenURI };
          });
          break;
        case FetchType.ERC1155:
          tokens = (response as ERC1155s).account.balances.map((b) => ({
            address: b.token.registry.contractAddress,
            tokenId: b.token.tokenId,
            tokenURI: b.token.tokenURI,
          }));
          break;
      }

      return tokens;
    },
    // ! do not add nfts as a dep, will cause infinite loop
    /* eslint-disable-next-line */
    [currentAddress, renft?.address, signer]
  );

  const fetchUsersNfts = async () => {
    if (!signer) return;
    const usersNfts721 = await fetchUserProd(FetchType.ERC721);
    const usersNfts1155 = await fetchUserProd(FetchType.ERC1155);
    const __usersNfts = usersNfts721.concat(usersNfts1155);
    const _usersNfts = __usersNfts.map(
      (nft) => new Nft(nft.address, nft.tokenId, signer)
    );
    let _nfts: Nft[] = _usersNfts;

    if (!IS_PROD) {
      const __nfts = await fetchNftDev();
      _nfts = _nfts.concat(__nfts);
    }

    setUsersNfts(_nfts);
  };

  const fetchUserLending = async () => {
    if (!currentAddress) return;
    const query = queryUserLendingRenft(currentAddress);
    const subgraphURI = IS_PROD ? ENDPOINT_RENFT_PROD : ENDPOINT_RENFT_DEV;
    const response: {
      user?: { lending?: { id: LendingId }[] };
    } = await timeItAsync(
      `Pulled My Lending Nfts`,
      async () => await request(subgraphURI, query)
    );
    const lendingsIds = response.user?.lending?.map(({ id }) => id) ?? [];
    _setUsersLending(lendingsIds);
  };

  const fetchUserRenting = async () => {
    if (!currentAddress) return;
    const query = queryUserRentingRenft(currentAddress);
    const subgraphURI = IS_PROD ? ENDPOINT_RENFT_PROD : ENDPOINT_RENFT_DEV;
    const response: {
      user?: { renting?: { id: RentingId }[] };
    } = await timeItAsync(
      `Pulled My Renting Nfts`,
      async () => await request(subgraphURI, query)
    );
    const rentingsIds = response.user?.renting?.map(({ id }) => id) ?? [];
    _setUsersRenting(rentingsIds);
  };

  const fetchRenftsAll = async () => {
    if (!signer) return;
    const query = queryAllRenft();
    const subgraphURI = IS_PROD ? ENDPOINT_RENFT_PROD : ENDPOINT_RENFT_DEV;
    const response: NftRaw = await timeItAsync(
      `Pulled All Renft Nfts`,
      async () => await request(subgraphURI, query)
    );
    const _allRenftsLending: { [key: string]: Lending } = {};
    const _allRenftsRenting: { [key: string]: Renting } = {};
    response?.nfts.forEach(({ id, lending, renting }) => {
      const [address, tokenId] = id.split(RENFT_SUBGRAPH_ID_SEPARATOR);
      lending?.forEach((l) => {
        _allRenftsLending[l.id] = new Lending(address, tokenId, signer, l);
      });
      renting?.forEach((r) => {
        _allRenftsRenting[r.id] = new Renting(address, tokenId, signer, r);
      });
    });

    setRenftsLending(_allRenftsLending);
    setRenftsRenting(_allRenftsRenting);
  };

  const getUsersLending = useMemo(() => {
    if (Object.keys(renftsLending).length === 0) return [];
    return _usersLending.map((l) => renftsLending[l]);
  }, [_usersLending, renftsLending]);

  const getUsersRenting = useMemo(() => {
    if (Object.keys(renftsRenting).length === 0) return [];
    return _usersRenting.map((r) => renftsRenting[r]);
  }, [_usersRenting, renftsRenting]);

  /**
   * Only used in the dev environment to pull third account's (test test ... junk)
   * mock NFTs
   */
  // const fetchNftDev = useFetchNftDev();

  useEffect(() => {
    fetchRenftsAll();
    fetchUsersNfts();
    fetchUserLending();
    fetchUserRenting();
    /* eslint-disable-next-line */
  }, []);

  usePoller(fetchUsersNfts, 10 * SECOND_IN_MILLISECONDS);

  return (
    <GraphContext.Provider
      value={{
        renftsLending,
        renftsRenting,
        usersNfts,
        usersLending: getUsersLending,
        usersRenting: getUsersRenting,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
