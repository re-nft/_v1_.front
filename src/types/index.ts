export type Optional<T> = undefined | T;
export type Address = string;
export type TransactionHash = string;
export type TokenId = string;
export type URI = string;

// ! this must be the same as in packages/contracts/Resolver.sol
// export enum PaymentToken {
//   SENTINEL, // 0
//   WETH, // 1
//   DAI, // 2
//   USDC, // 3
//   USDT, // 4
//   TUSD, // 5
// }

export enum TransactionStateEnum {
  FAILED = 0,
  SUCCESS = 1,
  PENDING = 2,
}

export enum NetworkName {
  mainnet = "mainnet", // this is called homestead
  ropsten = "ropsten",
  localhost = "localhost",
}

export type Path = string[];
import { PaymentToken } from "@renft/sdk";

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
  nftPrice: number;
  paymentToken: PaymentToken;
  collateralClaimed: boolean;
  isERC721: boolean;
  renting?: IRenting;
  duration?: string;
}

export type LendingRaw = {
  id: string;
  nftAddress: string;
  tokenId: string;
  lentAmount: string;
  lenderAddress: string;
  maxRentDuration: string;
  dailyRentPrice: string;
  nftPrice: string;
  paymentToken: string;
  collateralClaimed: boolean;
  isERC721: boolean;
  renting: RentingRaw;
};

export interface IRenting {
  id: string;
  renterAddress: Address;
  rentDuration: number;
  rentedAt: number;
  lendingId: string;
  lending: ILending;
}

export type RentingRaw = {
  id: string;
  renterAddress: string;
  rentDuration: string;
  rentedAt: string;
  lendingId: string;
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

export type ReactEventOnBlurType  = {
  (e: React.FocusEvent<unknown>): void | Promise<void | boolean>;
  <T = unknown>(fieldOrEvent: T): T extends string
    ? (e: unknown) => void | Promise<void | boolean>
    : void | Promise<void | boolean>;
};

export type ReactEventOnChangeType  = {
  (e: React.ChangeEvent<unknown>): void | Promise<void | boolean>;
  <T = string | React.ChangeEvent<unknown>>(
    field: T
  ): T extends React.ChangeEvent<unknown>
    ? void | Promise<void | boolean>
    : (e: string | React.ChangeEvent<unknown>) => void | Promise<void | boolean>;
};

export type ReactEventOnClickType  = {
  (e: React.MouseEvent<unknown>): void | Promise<void | boolean>;
  <T = string | React.MouseEvent<unknown>>(
    field: T
  ): T extends React.MouseEvent<unknown>
    ? void | Promise<void | boolean>
    : (e: string | React.MouseEvent<unknown>) => void | Promise<void | boolean>;
};
