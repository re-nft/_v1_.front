import { ERC721 } from "../../hardhat/typechain/ERC721";
import { ERC1155 } from "../../hardhat/typechain/ERC1155";
import { Address, Nft, PaymentToken, TokenId } from "../../types";

// todo: a lot of redundancy

export type MyERC721s = {
  tokens: {
    id: string; // e.g. "0xbcd4f1ecff4318e7a0c791c7728f3830db506c71_3000013"
    tokenURI: string; // e.g. "https://nft.service.cometh.io/3000013"
  }[];
};

export type TokenERC1155 = {
  URI?: string;
  tokenId: string;
  registry: {
    contractAddress: Address;
  };
};

export type BalanceERC1155 = {
  token: TokenERC1155;
  amount: number;
};

export type MyERC1155s = {
  account: {
    balances: BalanceERC1155[];
  };
};

// '0x123...456': { tokenIds: { '1': ..., '2': ... } }
export type AddressToErc721 = {
  [key: string]: {
    contract: ERC721;
    isApprovedForAll: boolean;
    tokenIds: {
      [key: string]: {
        meta?: Response;
      };
    };
  };
};

export type AddressToErc1155 = {
  [key: string]: {
    contract: ERC1155;
    isApprovedForAll: boolean;
    tokenIds: {
      [key: string]: {
        meta?: Response;
      };
    };
  };
};

export type AddressToLending = {
  [key: string]: {
    contract: ERC721 | ERC1155;
    isERC721: boolean;
    isERC1155: boolean;
    // * these are all approved, since I am lending them
    tokenIds: {
      [key: string]: Omit<Lending, "nftAddress" & "tokenId"> | undefined;
    };
  };
};

export type AddressToRenting = {
  [key: string]: {
    contract: ERC721 | ERC1155;
    isERC721: boolean;
    isERC1155: boolean;
    isApprovedForAll: boolean;
    tokenIds: {
      [key: string]: Renting;
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
