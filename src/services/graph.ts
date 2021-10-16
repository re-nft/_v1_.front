import request from "graphql-request";
import { Lending, Renting } from "renft-front/types/classes";
import {
  queryMyERC1155s,
  queryMyERC721s,
  queryUserRentingRenft,
} from "./queries";
import { ERC1155s, NftToken, RentingRaw } from "renft-front/types";
import * as Sentry from "@sentry/nextjs";

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

  const subgraphURI = process.env.NEXT_PUBLIC_EIP721_API;
  if (!subgraphURI) {
    return Promise.reject("EIP721_API is not defined");
  }
  const query = queryMyERC721s(currentAddress, skip);

  return request(subgraphURI, query)
    .then((response) => {
      if (response.tokens)
        return Promise.resolve(
          response.tokens.map((token) => {
            // ! in the case of ERC721 the raw tokenId is in fact `${nftAddress}_${tokenId}`
            const [address, tokenId] = token.id.split("_");
            return {
              address,
              tokenURI: token.tokenURI,
              tokenId,
              isERC721: true,
            };
          })
        );
      return Promise.resolve([]);
    })
    .catch((e) => {
      //TODO:eniko user feedback
      //TODO:eniko only log errors which doesn't result of not found pages
      Sentry.captureException(e);
      return Promise.resolve([]);
    });
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

  const subgraphURI = process.env.NEXT_PUBLIC_EIP1155_API;
  if (!subgraphURI) {
    return Promise.reject("EIP1155_API is not defined");
  }
  const query = queryMyERC1155s(currentAddress, skip);

  return request(subgraphURI, query)
    .then((response) => {
      if (response?.account?.balances)
        return Promise.resolve(
          (response as ERC1155s).account.balances.map(({ token }) => ({
            address: token.registry.contractAddress,
            tokenURI: token.tokenURI,
            tokenId: token.tokenId,
            isERC721: false,
          }))
        );
      return Promise.resolve([]);
    })
    .catch((e) => {
      //TODO:eniko only log errors which doesn't result of not found pages
      //TODO:eniko user feedback
      Sentry.captureException(e);
      return Promise.resolve([]);
    });
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
  if (!process.env.NEXT_PUBLIC_RENFT_API) {
    throw new Error("RENFT_API is not defined");
  }
  const query = queryUserRentingRenft(currentAddress);
  return request(subgraphURI, query);
};
