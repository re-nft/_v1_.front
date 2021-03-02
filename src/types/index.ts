import { ERC721 } from "../hardhat/typechain/ERC721";
import { ERC1155 } from "../hardhat/typechain/ERC1155";

import { Lending, Renting } from "./graph";

export type Optional<T> = undefined | T;
export type Address = string;
export type TransactionHash = string;
export type TokenId = string;
export type URI = string;

export enum PaymentToken {
  SENTINEL, // 0
  ETH, // 1
  DAI, // 2
  USDC, // 3
  USDT, // 4
  TUSD, // 5
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

export type NftAndLendRentInfo = Nft & {
  lendingId: string;
  lendingRentInfo: LendingRentInfo;
  rentingInfo?: Renting;
};
