import { Address, PaymentToken, TokenId } from "../../types";

export type NftToken = {
  address: Address;
  tokenId: TokenId;
  tokenURI?: string;
  meta?: {
    name?: string;
    image?: string;
    description?: string;
  };
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

export type Lending = {
  id: string;
  nftAddress: Address;
  tokenId: TokenId;
  lenderAddress: Address;
  maxRentDuration: number;
  dailyRentPrice: number;
  nftPrice: number;
  paymentToken: PaymentToken;
  collateralClaimed: boolean;
  rentingId?: string;
};

export type LendingRaw = Omit<
  Lending,
  "maxRentDuration" | "dailyRentPrice" | "nftPrice" | "paymentToken"
> & {
  maxRentDuration: string;
  dailyRentPrice: string;
  nftPrice: string;
  paymentToken: string;
};

export type Renting = {
  id: string;
  renterAddress: Address;
  rentDuration: number;
  rentedAt: number;
  lendingId: string;
  lending: Lending;
};

export type RentingRaw = Omit<Renting, "rentDuration" | "rentedAt"> & {
  rentDuration: string;
  rentedAt: string;
  lending: LendingRaw;
};

export type NftRaw = {
  nfts: {
    id: string;
    lending?: LendingRaw[];
    renting?: RentingRaw[];
  }[];
};

export type UserData = {
  name: string;
  favorites?: Record<string, boolean>;
};

export type UsersVote = {
  // nftAddress}::tokenId
  [key: string]: {
    // userAddress: [-1, 1]
    [key: string]: {
      upvote?: number;
      downvote?: number;
    } 
  }
};

export type CalculatedUserVote = {
  [key: string]: {
    upvote: number;
    downvote: number;
  };
};