import { ERC721 } from "../../hardhat/typechain/ERC721";
import { ERC1155 } from "../../hardhat/typechain/ERC1155";
import { Address, Nft, PaymentToken, TokenId } from "../../types";

// todo: a lot of redundancy

export type MyNft = {
  address: Address;
  tokenId: string;
  tokenURI?: string;
};

// raw data that comes from the eip721 subgraph
export type MyERC721s = {
  tokens: {
    id: string; // e.g. "0xbcd4f1ecff4318e7a0c791c7728f3830db506c71_3000013"
    tokenURI?: string; // e.g. "https://nft.service.cometh.io/3000013"
  }[];
};

// raw data that comes from the eip1155 subgraph
export type MyERC1155s = {
  account: {
    balances: {
      amount: number;
      token: {
        tokenId: string;
        tokenURI?: string;
        registry: {
          contractAddress: Address;
        };
      };
    }[];
  };
};

// '0x123...456': { tokenIds: { '1': ..., '2': ... } }
export type AddressToNft = {
  [key: string]: {
    contract: ERC721 | ERC1155;
    isERC721: boolean;
    isApprovedForAll: boolean;
    tokenIds: {
      [key: string]: {
        lending: Lending;
        renting: Renting;
        meta?: Response;
      };
    };
  };
};

export type UserData = {
  lendings: Lending[];
  rentings: RentingAndLending[];
};

export type LendingRaw = {
  id: string;
  nftAddress: string;
  tokenId: string;
  lenderAddress: string;
  maxRentDuration: string;
  dailyRentPrice: string;
  nftPrice: string;
  paymentToken: string;
  renting?: string;
  collateralClaimed: boolean;
};

export type Lending = {
  id: string;
  nftAddress: Address;
  tokenId: TokenId;
  lenderAddress: Address;
  maxRentDuration: number;
  dailyRentPrice: number;
  nftPrice: number;
  paymentToken: PaymentToken;
  renting?: string;
  collateralClaimed: boolean;
};

export type RentingRaw = {
  id: string;
  renterAddress: string;
  rentDuration: string;
  rentedAt: string;
  lending: string;
};

export type Renting = {
  id: string;
  renterAddress: Address;
  rentDuration: number;
  rentedAt: number;
  lendingId: string;
};

export type LendingRentingRaw = {
  id: string;
  lending: LendingRaw[];
  renting?: RentingRaw[];
};

export type LendingRenting = {
  id: string;
  lending: Lending[];
  renting?: Renting[];
};

export type UserRaw = {
  id: string;
  lending?: LendingRaw[];
  renting?: RentingRaw[];
};

export type RentingAndLending = Renting & {
  lending: Lending;
};

export type User = {
  id: string;
  lending?: Lending[];
  renting?: RentingAndLending[];
};

export type LendingRentInfo = Pick<
  Lending,
  "dailyRentPrice" | "maxRentDuration" | "paymentToken" | "nftPrice"
>;

export type NftAndLendingId = Nft & {
  lendingId: string;
  lendingRentInfo: LendingRentInfo;
};
