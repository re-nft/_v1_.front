import { ERC721 } from "./hardhat/typechain/ERC721";

export type Optional<T> = undefined | T;
export type Address = string;

// TODO: think this should be in typechain
export enum PaymentToken {
  DAI, // 0
  USDC, // 1
  USDT, // 2
  TUSD, // 3
}

export type Renting = {
  id: number;
  renterAddress: Address;
  rentDuration: number;
  rentedAt: number;
  lending: Omit<Lending, "renting">;
};

export type Lending = {
  id: number;
  nftAddress: string;
  tokenId: number;
  lenderAddress: Address;
  maxRentDuration: number;
  dailyRentPrice: number;
  nftPrice: number;
  paymentToken: PaymentToken;
  renting?: Omit<Renting, "lending">;
  collateralClaimed: boolean;
  imageUrl: string;
};

export type LendingRenting = {
  id: string;
  lending: Lending[];
  renting: Renting[]; // not required in graph, if that is the case, will default to zero length here
};

export type User = {
  id: Address;
  lending: Lending[]; // both are not required. If that is the case will default to the zero length
  renting: Renting[];
};

export type TokenId = string;
export type URI = string;

export type Nft = {
  contract: ERC721;
  tokenId: TokenId;
  image: URI;
  isApprovedForAll: boolean;
};
