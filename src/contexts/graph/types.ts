import { Address, PaymentToken, TokenId } from "../../types";

export type NftToken = {
  address: Address;
  tokenId: TokenId;
  isERC721: boolean;
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

export type LendingT = {
  id: string;
  nftAddress: Address;
  tokenId: TokenId;
  amount: string;
  lenderAddress: Address;
  maxRentDuration: number;
  dailyRentPrice: number;
  nftPrice: number;
  paymentToken: PaymentToken;
  collateralClaimed: boolean;
  renting?: RentingT;
};

export type LendingRaw = Omit<
  LendingT,
  "maxRentDuration" | "dailyRentPrice" | "nftPrice" | "paymentToken"
> & {
  maxRentDuration: string;
  dailyRentPrice: string;
  nftPrice: string;
  paymentToken: string;
  isERC721: boolean;
  lentAmount: string;
};

export type RentingT = {
  id: string;
  renterAddress: Address;
  rentDuration: number;
  rentedAt: number;
  lendingId: string;
  lending: LendingT;
};

export type RentingRaw = Omit<RentingT, "rentDuration" | "rentedAt"> & {
  rentDuration: string;
  rentedAt: string;
  lending: LendingRaw;
  isERC721: boolean;
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
