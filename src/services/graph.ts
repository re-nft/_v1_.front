import request from "graphql-request";
import { Lending, Renting } from "../contexts/graph/classes";
import {
  queryMyERC1155s,
  queryMyERC721s,
  queryUserRentingRenft,
} from "../contexts/graph/queries";
import {
  ERC1155s,
  ERC721s,
  NftToken,
  RentingRaw,
} from "../contexts/graph/types";
import { timeItAsync } from "../utils";
import createDebugger from "debug";

const debug = createDebugger("app:request:graph");

export enum FetchType {
  ERC721,
  ERC1155,
}

export type LendingId = string;
export type RentingId = LendingId;
/**
 * Sets the renftsLending and renftsRenting state. These are mappings from
 * lending id, renting id respectively to Lending, Renting instances,
 * respectively. These are all the NFTs on reNFT platform
 */
export type ReturnReNftAll = {
  lending: {
    [key: string]: Lending;
  };
  renting: {
    [key: string]: Renting;
  };
};

/**
 * Pings the eip721 and eip1155 subgraphs in prod, to determine what
 * NFTs you own
 */
export const fetchUserProd721 = async (
  currentAddress: string,
  skip = 0
): Promise<NftToken[]> => {
  if (!currentAddress) return [];
  let query = "";
  let subgraphURI = "";
  query = queryMyERC721s(currentAddress, skip);

  if (!process.env.NEXT_PUBLIC_EIP721_API) {
    throw new Error("EIP721_API is not defined");
  }
  subgraphURI = process.env.NEXT_PUBLIC_EIP721_API;

  const response: ERC721s = await timeItAsync(
    `Pulled My ${FetchType[FetchType.ERC721]} NFTs`,
    async () => request(subgraphURI, query)
  );

  const tokens: NftToken[] = (response as ERC721s).tokens.map((token) => {
    // ! in the case of ERC721 the raw tokenId is in fact `${nftAddress}_${tokenId}`
    const [address, tokenId] = token.id.split("_");
    return {
      address,
      tokenURI: token.tokenURI,
      tokenId,
      isERC721: true,
    };
  });

  // TODO: compute hash of the fetch, and everything, to avoid resetting the state, if
  // TODO: nothing has changed
  return tokens;
};

/**
 * Pings the eip721 and eip1155 subgraphs in prod, to determine what
 * NFTs you own
 */
export const fetchUserProd1155 = async (
  currentAddress: string,
  skip = 0
): Promise<NftToken[]> => {
  if (!currentAddress) return [];
  let query = "";
  let subgraphURI = "";

  query = queryMyERC1155s(currentAddress, skip);
  if (!process.env.NEXT_PUBLIC_EIP1155_API) {
    throw new Error("EIP1155_API is not defined");
  }
  subgraphURI = process.env.NEXT_PUBLIC_EIP1155_API;

  const response: ERC1155s = await timeItAsync(
    `Pulled My ${FetchType[FetchType.ERC1155]} NFTs`,
    async () => request(subgraphURI, query)
  );

  const tokens: NftToken[] =
    (response as ERC1155s).account?.balances?.map(({ token }) => ({
      address: token.registry.contractAddress,
      tokenURI: token.tokenURI,
      tokenId: token.tokenId,
      isERC721: false,
    })) || [];

  // TODO: compute hash of the fetch, and everything, to avoid resetting the state, if
  // TODO: nothing has changed
  return tokens;
};

export type FetchUserRentingReturn =
  | {
      users?:
        | {
            renting?: RentingRaw[] | undefined;
          }[]
        | undefined;
    }
  | undefined;

export const fetchUserRenting = async (
  currentAddress: string | undefined
): Promise<FetchUserRentingReturn> => {
  if (!currentAddress) return;
  const query = queryUserRentingRenft(currentAddress);
  if (!process.env.NEXT_PUBLIC_RENFT_API) {
    throw new Error("RENFT_API is not defined");
  }
  const subgraphURI = process.env.NEXT_PUBLIC_RENFT_API;
  const response: FetchUserRentingReturn = await timeItAsync(
    "Pulled My Renft Renting Nfts",
    async () => await request(subgraphURI, query)
  );
  return response;
};
