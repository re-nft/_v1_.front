import { ERC721 } from "../hardhat/typechain/ERC721";
import { ERC1155 } from "../hardhat/typechain/ERC1155";

import { Lending } from "./graph";

export type Optional<T> = undefined | T;
export type Address = string;
export type TransactionHash = string;
export type TokenId = string;
export type URI = string;

export enum PaymentToken {
  DAI, // 0
  USDC, // 1
  USDT, // 2
  TUSD, // 3
  RENT, // 4
}

export type Nft = {
  contract?: ERC721 | ERC1155;
  tokenId: TokenId;
  image: URI;
};

export enum TransactionStateEnum {
  FAILED,
  SUCCESS,
  PENDING,
}

export type LendingRentInfo = Pick<
  Lending,
  "dailyRentPrice" | "maxRentDuration" | "paymentToken" | "nftPrice"
>;

export type NftAndLendingId = Nft & {
  lendingId: string;
  lendingRentInfo: LendingRentInfo;
};
