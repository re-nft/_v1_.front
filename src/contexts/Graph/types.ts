import { ERC721 } from "../../hardhat/typechain/ERC721";
import { ERC1155 } from "../../hardhat/typechain/ERC1155";
import { Address, PaymentToken, TokenId } from "../../types";

export type ERCNft = {
  contract?: ERC721 | ERC1155;
  isERC721?: boolean;
  address: Address;
  tokenId: string;
  tokenURI?: string;
  // ERC1155 can be semi-fungible
  amount?: number;
  // * we have meta here, because we will pull extra info in the future
  // * like attributes, preview image if available, and so on
  meta?: {
    // * if we can only get a blob from ipfs, then we createObjectURI
    mediaURI?: string;
  };
  // links up with the data structure in Graph context that will
  // give you the lending related data if you access it with this
  // id
  lending?: Lending["id"][];
  renting?: Renting["id"][];
};

// ! NON-RENFT SUBGRAPHS for 721 and 1155

// raw data that comes from the eip721 subgraph
export type ERC721s = {
  tokens: {
    id: string; // e.g. "0xbcd4f1ecff4318e7a0c791c7728f3830db506c71_3000013"
    tokenURI?: ERCNft["tokenURI"]; // e.g. "https://nft.service.cometh.io/3000013"
  }[];
};

// raw data that comes from the eip1155 subgraph
export type ERC1155s = {
  account: {
    balances: {
      amount: number;
      token: {
        tokenId: ERCNft["tokenId"];
        tokenURI?: ERCNft["tokenURI"];
        registry: {
          contractAddress: Address;
        };
      };
    }[];
  };
};

// ! RENFT SUBGRAPH BELOW

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

// ! Tracks all of the lending of renting of a single NFT
// same NFT can be re-lent / re-rented multiple times
// this location tracks all of that
// per unique id := nftAddress::tokenId combination
//
// 1. Note: you will always have an array of lending
// but not neccesarily an array of renting. This is because
// if AllRenft entity is created, then the entry point's
// event is lend event. renting array is only ever populated
// if the Nft has been rented.
//
// 2. Note: that this is a single entity and there will be multiple
// entities. When we make a graphql request, we will be pulling ALL
// such entities
//
// 3. Also note that when this nftAddress::tokenId unique combo gets
// re-lent by the renter, we push into the lending array. This implies
// that if you have lending.length === renting.length + 1, then the
// nft and tokenId combo are available for lend.
// If, however, lending.length === renting.length, then it is being currently
// rented by someone.
export type Nft = {
  id: Address;
  lending: Lending["id"][];
  renting?: Renting["id"][];
};

// ! Tracks all of the lending / renting per user
// in comparison to AllRenft, User will only track user's
// lending and renting.
// 1. Note: unlike in AllRenft, each lending here is now a unique
// nftAddress and tokenId. Recall, in AllRenft each lending is the
// same nftAddress and tokenId combo. Same reasoning applies to renting.
export type User = {
  lending?: Lending["id"][];
  renting?: Renting["id"][];
};

export type Token = {
  address: ERCNft["address"];
  tokenId: ERCNft["tokenId"];
  tokenURI?: ERCNft["tokenURI"];
};
