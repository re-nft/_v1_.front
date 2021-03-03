import React, { createContext, useContext, useState, useCallback } from "react";
import { request } from "graphql-request";
import { hasPath } from "ramda";

import {
  CurrentAddressContext,
  RentNftContext,
  SignerContext,
} from "../../hardhat/SymfoniContext";
import { getERC1155, getERC721, THROWS, timeItAsync } from "../../utils";
import { usePoller } from "../../hooks/usePoller";
import {
  SECOND_IN_MILLISECONDS,
  RENFT_SUBGRAPH_ID_SEPARATOR,
} from "../../consts";

import { Address } from "../../types";
import {
  queryUserRenft,
  queryAllRenft,
  queryMyERC721s,
  queryMyERC1155s,
} from "./queries";
import {
  Lending,
  Renting,
  User,
  ERC1155s,
  ERC721s,
  ERCNft,
  Nft,
  Token,
} from "./types";
import { parseLending } from "./utils";
// * only in dev env
import useFetchNftDev from "./hooks/useFetchNftDev";

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

// differently arranged (for efficiency) Nft
// '0x123...456': { tokens: { '1': ..., '2': ... } }
export type Nfts = {
  // nft address
  [key: string]: {
    contract: ERCNft["contract"];
    // * if there is ever a new type of NFT
    // * this boolean flag will be invalid, update enum FetchType then as well
    isERC721: ERCNft["isERC721"];
    tokens: {
      // tokenId
      [key: string]: {
        // multiple lending and renting ids, because the same
        // nft can be re-lent / re-rented multiple times
        lending?: ERCNft["lending"];
        renting?: ERCNft["renting"];
        tokenURI?: ERCNft["tokenURI"];
        meta?: ERCNft["meta"];
      };
    };
  };
};

// AddressToNft's LendingId is the key of this type
// convenience 1-1 map between lendingId and AddressToNft
type LendingById = {
  // mapping (lendingId => nft address and tokenId)
  [key: string]: {
    address: Address;
    tokenId: string;
  };
};
type RentingById = LendingById;

type GraphContextType = {
  nfts: Nfts;
  usersNfts: Omit<Token, "tokenURI">[];
  lendingById: LendingById;
  rentingById: RentingById;
  user: User;
  fetchMyNfts: () => void;
  removeLending: (nfts: ERCNft[]) => void;
  getUsersNfts: () => ERCNft[];
};

const DefaultGraphContext: GraphContextType = {
  nfts: {},
  usersNfts: [],
  lendingById: {},
  rentingById: {},
  user: {},
  removeLending: THROWS,
  fetchMyNfts: THROWS,
  getUsersNfts: () => {
    throw new Error("must be implemented");
  },
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

  // all the seen nfts in renft client
  const [nfts, setNfts] = useState<Nfts>(DefaultGraphContext["nfts"]);
  // an array of Omit<Token, 'tokenURI'> of a user to map back to nfts above
  // usersNfts is a set of all of the NFTs of the user
  const [usersNfts, setUsersNfts] = useState<Omit<Token, "tokenURI">[]>([]);
  // an array of user's lendings and rentings on renft
  // user is the set of all of the NFTs of the user that are related to ReNFT
  const [user, setUser] = useState<User>(DefaultGraphContext["user"]);
  const [lendingById, setLendingById] = useState<LendingById>(
    DefaultGraphContext["lendingById"]
  );
  const [rentingById, setRentingById] = useState<RentingById>(
    DefaultGraphContext["rentingById"]
  );

  const fetchNftDev = useFetchNftDev(setUsersNfts);

  const _setTokenId = (token: Token) => {
    if (hasPath([token.address, "tokenIds", token.tokenId])(nfts)) return;

    setNfts((prev) => ({
      ...prev,
      [token.address]: {
        ...prev[token.address],
        tokens: {
          ...prev[token.address].tokens,
          [token.tokenId]: {
            tokenURI: token.tokenURI,
          },
        },
      },
    }));
  };

  const _setContract = async (token: Token, isERC721: boolean) => {
    if (nfts[token.address]?.contract) return;

    const contract = isERC721
      ? getERC721(token.address, signer)
      : getERC1155(token.address, signer);
    const isApprovedForAll = await contract
      .isApprovedForAll(currentAddress, renft?.address ?? "")
      .catch(() => false);

    setNfts((prev) => ({
      ...prev,
      [token.address]: {
        ...prev[token.address],
        contract,
        isApprovedForAll,
        isERC721,
        tokens: {
          [token.tokenId]: {
            tokenURI: token.tokenURI,
          },
        },
      },
    }));
  };

  const _parseRenftNftId = (
    id: string
  ): { address: Token["address"]; tokenId: Token["tokenId"] } => {
    const [address, tokenId] = id.split(RENFT_SUBGRAPH_ID_SEPARATOR);
    return { address, tokenId };
  };

  // * uses the eip1155 subgraph to pull all your erc1155 holdings
  // * uses the eip721  subgraph to pull all your erc721  holdings
  /**
   * Fetches ALL the NFTs that the user owns.
   * The ones that the user has lent, won't show here obviously,
   * because they are in reNFT's escrow.
   * The ones that the user is renting, will show here, because
   * they now own those NFTs.
   */
  const fetchAllERCs = useCallback(
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
      console.log(response);

      let tokens: Token[] = [];
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

      for (const token of tokens) {
        // ? await in loop is safe?
        await _setContract(token, fetchType === FetchType.ERC721);
        _setTokenId(token);
      }
    },
    // ! do not add nfts as a dep, will cause infinite loop
    /* eslint-disable-next-line */
    [currentAddress, renft?.address, signer]
  );

  const fetchUser = useCallback(async () => {
    const query = queryUserRenft(currentAddress);
    // todo: the types for lending and renting not correct, because we get raw
    // response from request. Wrap the call in a parsing function
    const data: {
      lending?: { id: string }[];
      renting?: { id: string }[];
    } = await request(
      // TODO
      ENDPOINT_RENFT_DEV,
      // IS_PROD ? ENDPOINT_RENFT_PROD : ENDPOINT_RENFT_DEV,
      query
    );
    if (!data?.lending && !data?.renting) {
      console.warn("no lending and renting for user");
      return;
    }

    const { lending, renting } = data;
    // * updated all the time, need to compute hash of the lists
    // * as we go along to then simply check that the combined hash
    // * hasn't changed, to determine if we need to update the state
    const _user = {
      id: currentAddress,
      lending: lending?.map((l) => l.id) ?? [],
      renting: renting?.map((r) => r.id) ?? [],
    };
    console.log("setting user", _user);

    setUser(_user);
  }, [currentAddress]);

  // these are all the NFTs that are available for rent
  const fetchAllLendingAndRenting = useCallback(async () => {
    const query = queryAllRenft();
    // * type is not exactly correct because lending and renting
    // TODO: are raw in here. Create a function that parses the raw
    // * into these types and wrap / call that function in here
    const data: {
      nfts: (Pick<Nft, "id"> & { lending: Lending[]; renting?: Renting[] })[];
    } = await request(
      ENDPOINT_RENFT_DEV,
      // todo
      // IS_PROD ? ENDPOINT_RENFT_PROD : ENDPOINT_RENFT_DEV,
      query
    );
    if (!data?.nfts) return;

    const { nfts: _nfts } = data;
    for (const _nft of _nfts) {
      const { address, tokenId } = _parseRenftNftId(_nft.id);
      // each Nft has an array of lending and renting, only the last
      // item in each one is the source of truth when it comes to
      // ability to lend or rent
      for (const lending of _nft.lending) {
        if (lendingById[lending.id]) continue;
        setLendingById((prev) => ({
          ...prev,
          [lending.id]: {
            address,
            tokenId,
          },
        }));
      }
      for (const renting of _nft.renting ?? []) {
        if (rentingById[renting.id]) continue;
        setRentingById((prev) => ({
          ...prev,
          [renting.id]: {
            address,
            tokenId,
          },
        }));
      }

      console.log("lendingById", lendingById);
      console.log("rentingById", rentingById);
    }
    // ! do not add lendingById and rentingById in deps
    // ! you will have an infinite loop
    /* eslint-disable-next-line */
  }, []);

  // - separation of concerns. set whatever you need to set, single purpose
  // - separate poller, glues together. looks through lending ids and sees
  // that there is no contract for that nft, instantiates
  // - another poller looks through fetched nfts from eip721 and 1155,
  // sees that meta is missing, tries to fetch it with the exponential backoff

  // little helper table
  // - fetchAllERCs(721)         | all my nfts 721   | available for lend | could have been rented
  // - fetchAllERCs(1155)        | all my nfts 1155  | available for lend | could have been rented
  // - fetchNftDev               | all my nfts mock  | available for lend | could have been rented
  // - fetchAllLendingAndRenting | all renft nfts    | available for rent | available for re-lend  | current re-lendings and re-rentings
  // - fetchUser                 | all my renft nfts | I lend | I rent
  // * What goes into nfts state?
  // * fetchAllERCs, fetchNftDev
  // * --------------------------
  // * User's lendings will not be returned in fetchAllERCs, fetchNftDev
  // * because they are owned by someone else
  // * To instantiate these contracts, we first pull all of the user's
  // * lendings and rentings with fetchUser
  // * We do one set here, to nfts. Therefore this is a central source of
  // * truth about all the NFTs seen by reNFT's client.
  // * To understand which Nfts the user owns, look into the usersNfts state var.
  // * This only gets set in fetchAllERCs and fetchNftDev
  const fetchMyNfts = useCallback(async () => {
    if (IS_PROD) {
      fetchAllERCs(FetchType.ERC721);
      fetchAllERCs(FetchType.ERC1155);
    } else {
      const _nfts = await fetchNftDev();
      console.log("fetched my dev nfts", _nfts);
      setNfts(_nfts);
    }
  }, [fetchAllERCs, fetchNftDev]);

  usePoller(fetchMyNfts, 10 * SECOND_IN_MILLISECONDS); // all of my NFTs (unrelated or related to ReNFT)
  usePoller(fetchAllLendingAndRenting, 9 * SECOND_IN_MILLISECONDS); // all of the lent NFTs on ReNFT
  // usePoller(fetchRenting, 8 * SECOND_IN_MILLISECONDS); // all of the rented NFTs on ReNFT
  usePoller(fetchUser, 9 * SECOND_IN_MILLISECONDS); // all of my NFTs (related to ReNFT)

  const getUsersNfts = () => {
    const _nfts: ERCNft[] = [];
    for (const _token of usersNfts) {
      if (!nfts[_token.address]) continue;
      _nfts.push({
        contract: nfts[_token.address].contract,
        isERC721: nfts[_token.address].isERC721,
        address: _token.address,
        tokenId: _token.tokenId,
        tokenURI: nfts[_token.address].tokens[_token.tokenId].tokenURI,
        // TODO: meta, lending, renting
      });
    }
    return _nfts;
  };

  return (
    <GraphContext.Provider
      value={{
        nfts,
        fetchMyNfts,
        removeLending: () => {
          true;
        },
        getUsersNfts,
        usersNfts,
        user,
        lendingById,
        rentingById,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
