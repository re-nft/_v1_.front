export type Optional<T> = undefined | T;

export type Address = string;

export type Nft = {
  nftAddress: Address;
  tokenId: string;
};

export enum PaymentToken {
  DAI, // 0
  USDC, // 1
  USDT, // 2
  TUSD, // 3
  ETH, // 4
  UNI, // 5
  YFI, // 6
  NAZ, // 7
}

export type Lending = {
  id: string;
  nftAddress: Nft["nftAddress"];
  tokenId: Nft["tokenId"];
  lenderAddress: Address;
  maxRentDuration: string;
  dailyRentPrice: string;
  nftPrice: string;
  paymentToken: PaymentToken;
  renting: Renting;
  collateralClaimed: boolean;
};

export type Renting = {
  id: string;
  renterAddress: string;
  rentDuration: string;
  rentedAt: string;
  lending: Lending;
};

// will always have at least one lending, that is how this type
// is created in graph
// tracks a particular NFT's-tokenId's all lending and renting
export type LendingRenting = {
  id: string;
  lending: Lending[];
  renting?: Renting[];
};

// in comparison to the above, this tracks all of the user's
// lending and renting
export type User = {
  id: string;
  lending?: Lending[];
  renting?: Renting[];
};
