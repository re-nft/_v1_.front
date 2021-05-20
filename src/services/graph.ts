import request from "graphql-request";
import {
  queryMyERC1155s,
  queryMyERC721s,
} from "../contexts/graph/queries";
import {
  ERC1155s,
  ERC721s,
  LendingRaw,
  NftToken,
} from "../contexts/graph/types";
import { timeItAsync } from "../utils";

export enum FetchType {
  ERC721,
  ERC1155,
}

/**
 * Pings the eip721 and eip1155 subgraphs in prod, to determine what
 * NFTs you own
 */
export const fetchUserProd721 = async (
  currentAddress: string,
  fetchType: FetchType
): Promise<NftToken[]> => {
  if (!currentAddress) return [];
  let query = "";
  let subgraphURI = "";
  query = queryMyERC721s(currentAddress);

  if (!process.env.REACT_APP_EIP721_API) {
    throw new Error("EIP721_API is not defined");
  }
  subgraphURI = process.env.REACT_APP_EIP721_API;

  const response: ERC721s = await timeItAsync(
    `Pulled My ${FetchType[fetchType]} NFTs`,
    async () => await request(subgraphURI, query)
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
  fetchType: FetchType
): Promise<NftToken[]> => {
  if (!currentAddress) return [];
  let query = "";
  let subgraphURI = "";

  query = queryMyERC1155s(currentAddress);
  if (!process.env.REACT_APP_EIP1155_API) {
    throw new Error("EIP1155_API is not defined");
  }
  subgraphURI = process.env.REACT_APP_EIP1155_API;

  const response: ERC1155s = await timeItAsync(
    `Pulled My ${FetchType[fetchType]} NFTs`,
    async () => await request(subgraphURI, query)
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

