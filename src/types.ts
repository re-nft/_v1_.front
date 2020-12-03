export type Optional<T> = undefined | T;

export type Address = string;

export type Nft = {
  nftAddress: Address;
  tokenId?: string;
  imageUrl?: string;
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

// * note that this is NOT the full type!
export type OpenSeaNft = {
  id: string;
  token_id: string;
  num_sales: string;
  image_url: string;
  name: string;
  description: string;
  asset_contract: {
    address: Address;
    owner: number;
  };
  owner: {
    user: {
      username: string;
    };
    profile_img_url: string;
    address: Address;
  };
};
