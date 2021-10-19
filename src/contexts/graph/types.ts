//@ts-ignore

import { PaymentToken } from "@eenagy/sdk";
import { Address, TokenId } from "../../types";

export type NftTokenMeta = {
  name?: string;
  nId: string;
  image?: string;
  description?: string;
  openseaLink?: string;
  collection?: {
    name: string;
    description: string;
    imageUrl: string;
  };
};

export type NftToken = {
  address: Address;
  tokenId: TokenId;
  isERC721: boolean;
  tokenURI?: string;
  meta?: NftTokenMeta;
};

// ! NON-RENFT SUBGRAPHS for 721 and 1155

// raw data that comes from the eip721 subgraph
export type ERC721s = {
  tokens: {
    // e.g. "0xbcd4f1ecff4318e7a0c791c7728f3830db506c71_3000013"
    id: string;
    // e.g. "https://nft.service.cometh.io/3000013"
    tokenURI?: NftToken["tokenURI"];
  }[];
};

// raw data that comes from the eip1155 subgraph
export type ERC1155s = {
  account: {
    balances: {
      amount: number;
      token: {
        tokenId: NftToken["tokenId"];
        tokenURI?: NftToken["tokenURI"];
        registry: {
          contractAddress: Address;
        };
      };
    }[];
  };
};

// ! RENFT SUBGRAPH BELOW

export interface ILending {
  id: string;
  nftAddress: Address;
  tokenId: TokenId;
  lentAmount: string;
  lenderAddress: Address;
  maxRentDuration: number;
  dailyRentPrice: number;
  paymentToken: PaymentToken;
  rentClaimed: boolean;
  is721: boolean;
  renting?: IRenting;
  lentAt: number;
}

export type LendingRaw = {
  id: string;
  nftAddress: string;
  tokenID: string;
  lendAmount: string;
  lenderAddress: string;
  maxRentDuration: string;
  dailyRentPrice: string;
  paymentToken: string;
  rentClaimed: boolean;
  is721: boolean;
  renting: RentingRaw[];

};

export interface IRenting {
  id: string;
  renterAddress: Address;
  rentDuration: number;
  rentedAt: number;
  lendingId: string;
  lending: ILending;
  expired: boolean;
}

export type RentingRaw = {
  id: string;
  renterAddress: string;
  rentDuration: string;
  rentedAt: string;
  lendingId: string;
  lending: LendingRaw;
  expired: boolean;
};

export type NftRaw = {
  nfts: {
    id: string;
    lending?: LendingRaw[];
    renting?: RentingRaw[];
  }[];
};

export type UserData = {
  name?: string;
  bio?: string;
  favorites?: Record<string, boolean>;
};

export type UsersVote = {
  // ${nftAddress}${RENFT_SUBGRAPH_ID_SEPARATOR}tokenId
  [key: string]: {
    // userAddress: [-1, 1]
    [key: string]: {
      upvote?: number;
      downvote?: number;
    };
  };
};

export type CalculatedUserVote = {
  [key: string]: {
    upvote: number;
    downvote: number;
  };
};
