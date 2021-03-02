import React, { createContext, useContext, useState, useCallback } from "react";
import { request } from "graphql-request";
import parse from "url-parse";
import { set as ramdaSet, lensPath, hasPath } from "ramda";

import {
  CurrentAddressContext,
  RentNftContext,
  SignerContext,
} from "../../hardhat/SymfoniContext";
import { getERC1155, getERC721, THROWS, timeItAsync } from "../../utils";
import { usePoller } from "../../hooks/usePoller";
import { Path } from "../../types";
import { SECOND_IN_MILLISECONDS } from "../../consts";
import BufferList from "bl";
//@ts-ignore
import ipfsAPI from "ipfs-http-client";

const ipfs = ipfsAPI({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});
// import useIpfsFactory from "../../hooks/ipfs/useIpfsFactory";

import { Lending, Renting, User, ERC1155s, ERC721s, ERCNft } from "./types";
import { Address } from "../../types";
import {
  queryUserRenft,
  queryAllRenft,
  queryMyERC721s,
  queryMyERC1155s,
} from "./queries";
import { parseLending } from "./utils";
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

// ! WHAT IS REQUIRED TO SIMPLIFY META FETCHING
// 1. UNIFIED OUTPUT TYPE.
// address, tokenId, tokenURI (optional)
// 2. If tokenURI is not returned from query, try calling contract directly ERC721(address).tokenURI(tokenId) or ERC1155(address).baseURI() + "/" + tokenId
// 3. Update tokenURI if found, set to null if not found
// 4. Determine if the tokenURI link is ipfs or not.
// 5. Pull the meta selectively initially. Pulling everything will be costly, with just need image meta for now
// 6. the above pulling is done on a unified output type as per (1). Which means erc721 and erc1155 graph output needs to be commonised

// const CORS_PROXY = process.env["REACT_APP_CORS_PROXY"];
const IS_PROD =
  process.env["REACT_APP_ENVIRONMENT"]?.toLowerCase() === "production";

const ENDPOINT_RENFT_PROD =
  "https://api.thegraph.com/subgraphs/name/nazariyv/rentnft";
const ENDPOINT_RENFT_DEV =
  "http://localhost:8000/subgraphs/name/nazariyv/ReNFT";

const ENDPOINT_EIP721_PROD =
  "https://api.thegraph.com/subgraphs/name/wighawag/eip721-subgraph";
const ENDPOINT_EIP1155_PROD =
  "https://api.thegraph.com/subgraphs/name/amxx/eip1155-subgraph";

type GraphContextType = {
  myNfts: AddressToNft;
  user: User;
  fetchAvailableNfts: () => void;
  removeLending: (nfts: ERCNft[]) => void;
};

type LendingId = string;
type RentingId = LendingId;

// differently arranged (for efficiency) Nft
// '0x123...456': { tokens: { '1': ..., '2': ... } }
type AddressToNft = {
  [key: string]: {
    contract: ERCNft["contract"];
    isERC721: ERCNft["isERC721"];
    tokens: {
      // tokenId
      [key: string]: {
        // multiple lending and renting ids, because the same
        // nft can be re-lent / re-rented multiple times
        lending?: LendingId[];
        renting?: RentingId[];
        tokenURI?: ERCNft["tokenURI"];
        meta?: ERCNft["meta"];
      };
    };
  };
};

// AddressToNft's LendingId is the key of this type
type LendingById = {
  [key: string]: {
    address: Address;
    tokenId: string;
  };
};

// AddressToNft's RentingId is the key of this type
type RentingById = LendingById;

const DefaultGraphContext: GraphContextType = {
  myNfts: {},
  user: {
    address: "",
  },
  removeLending: THROWS,
  fetchAvailableNfts: THROWS,
};

enum FetchType {
  ERC721,
  ERC1155,
}

const getFromIPFS = async (hashToGet: string) => {
  for await (const file of ipfs.get(hashToGet)) {
    if (!file.content) continue;
    const content = new BufferList();
    for await (const chunk of file.content) {
      content.append(chunk);
    }
    return content;
  }
};

const GraphContext = createContext<GraphContextType>(DefaultGraphContext);

export const GraphProvider: React.FC = ({ children }) => {
  // ! currentAddress can be ""
  const [currentAddress] = useContext(CurrentAddressContext);
  const [signer] = useContext(SignerContext);
  const [myNfts, setMyNfts] = useState<AddressToNft>(
    DefaultGraphContext["myNfts"]
  );
  const [user, setUser] = useState<User>(DefaultGraphContext["user"]);
  const { instance: renft } = useContext(RentNftContext);
  const fetchNftDev = useFetchNftDev();

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

      let tokens: {
        address: ERCNft["address"];
        tokenId: ERCNft["tokenId"];
        tokenURI?: ERCNft["tokenURI"];
      }[] = [];
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
        // ? dependency on current state
        // ? without having it as dependency in useCallback which would trigger infinite loop
        if (!myNfts[token.address].contract) {
          const isERC721 = fetchType === FetchType.ERC721;
          const contract = isERC721
            ? getERC721(token.address, signer)
            : getERC1155(token.address, signer);
          const isApprovedForAll = await contract
            .isApprovedForAll(currentAddress, renft?.address ?? "")
            .catch(() => false);

          setMyNfts((prev) => ({
            ...prev,
            [token.address]: {
              ...prev[token.address],
              contract,
              isApprovedForAll,
              isERC721,
              tokens: {
                ...prev[token.address].tokens,
                [token.tokenId]: {
                  tokenURI: token.tokenURI,
                },
              },
            },
          }));
        }
        // if there isn't token with a particular tokenId in the state
        else if (!hasPath([token.address, "tokenIds", token.tokenId])(myNfts)) {
          setMyNfts((prev) => ({
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
        }
      }
    },
    // ! do not add myNFTs as dep, will cause infinite loop
    /* eslint-disable-next-line */
    [currentAddress, renft?.address, signer]
  );

  const fetchUser = useCallback(async () => {
    const query = queryUserRenft(currentAddress);
    const data: {
      user: User;
    } = await request(
      IS_PROD ? ENDPOINT_RENFT_PROD : ENDPOINT_RENFT_DEV,
      query
    );
    if (!data || !data.user) return [];
    const { lending, renting } = data.user;
    setUser({
      address: currentAddress,
      lending: lending || [],
      renting: renting || [],
    });
    // todo: make User -> ERCNft
  }, [currentAddress]);

  // queries ALL of the lendings in reNFT. Uses reNFT's subgraph
  const fetchLending = useCallback(async () => {
    const query = queryAllRenft();
    const { allRenft } = await request(
      ENDPOINT_RENFT_DEV,
      // todo
      // IS_PROD ? ENDPOINT_RENFT_PROD : ENDPOINT_RENFT_DEV,
      query
    );
    if (!allRenft) return [];
    const resolvedData: Lending[] = [];
    for (let i = 0; i < allRenft.length; i++) {
      const numTimesLent = allRenft[i].lending.length;
      const numTimesRented = allRenft[i].renting?.length ?? 0;
      const isAvailable = numTimesLent === numTimesRented + 1;
      if (!isAvailable) continue;
      const item = parseLending(allRenft[i].lending[numTimesLent - 1]);
      resolvedData.push(item);
    }
    // _enrichSetLending(resolvedData);
  }, []);

  const fetchRenting = useCallback(async () => {
    true;
  }, []);

  const fetchMyNfts = useCallback(async () => {
    if (IS_PROD) {
      fetchAllERCs(FetchType.ERC721);
      fetchAllERCs(FetchType.ERC1155);
    } else {
      fetchNftDev();
    }
  }, [fetchAllERCs, fetchNftDev]);

  usePoller(fetchMyNfts, 30 * SECOND_IN_MILLISECONDS); // all of my NFTs (unrelated or related to ReNFT)
  usePoller(fetchLending, 9 * SECOND_IN_MILLISECONDS); // all of the lent NFTs on ReNFT
  usePoller(fetchRenting, 8 * SECOND_IN_MILLISECONDS); // all of the rented NFTs on ReNFT
  usePoller(fetchUser, 7 * SECOND_IN_MILLISECONDS); // all of my NFTs (related to ReNFT)

  return (
    <GraphContext.Provider
      value={{
        myNfts,
        fetchAvailableNfts: fetchMyNfts,
        removeLending: () => {
          true;
        },
        user,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
