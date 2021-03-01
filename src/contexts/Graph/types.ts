import { ERC721 } from "../../hardhat/typechain/ERC721";
import { ERC1155 } from "../../hardhat/typechain/ERC1155";
import { Address, PaymentToken, TokenId } from "../../types";

// todo: a lot of redundancy

export type Nft = {
  contract?: ERC721 | ERC1155;
  isERC721: boolean;
  address: Address;
  tokenId: string;
  tokenURI?: string;
  meta?: {
    mediaURI?: string;
    media?: Blob;
  };
  lending?: Lending[];
  renting?: Renting[];
};

// raw data that comes from the eip721 subgraph
export type MyERC721s = {
  tokens: {
    tokenId: Nft["tokenId"]; // e.g. "0xbcd4f1ecff4318e7a0c791c7728f3830db506c71_3000013"
    tokenURI?: Nft["tokenURI"]; // e.g. "https://nft.service.cometh.io/3000013"
  }[];
};

// raw data that comes from the eip1155 subgraph
export type MyERC1155s = {
  account: {
    balances: {
      amount: number;
      token: {
        tokenId: Nft["tokenId"];
        tokenURI?: Nft["tokenURI"];
        registry: {
          contractAddress: Address;
        };
      };
    }[];
  };
};

// differently arranged (for efficiency) MyNft
// '0x123...456': { tokens: { '1': ..., '2': ... } }
export type AddressToNft = {
  [key: string]: {
    contract: Nft["contract"];
    isERC721: Nft["isERC721"];
    tokens: {
      // tokenId
      [key: string]: {
        lending?: Nft["lending"];
        renting?: Nft["renting"];
        tokenURI?: Nft["tokenURI"];
        meta?: Nft["meta"];
      };
    };
  };
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

export type Renting = {
  id: string;
  renterAddress: Address;
  rentDuration: number;
  rentedAt: number;
  lendingId: string;
};

export type LendingRenting = {
  id: string;
  lending: Lending[];
  renting: Renting[];
};

export type User = {
  address: Address;
  lending: Lending[];
  renting: Renting[];
};
