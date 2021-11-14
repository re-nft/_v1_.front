import { getUniqueID, parseLending, parseRenting } from "renft-front/utils";
import {
  LendingRaw,
  RentingRaw,
  ILending,
  NftToken,
  Address,
  TokenId,
} from ".";
import { PaymentToken } from "@renft/sdk";

export enum NftType {
  Nft,
  Lending,
  Renting,
}

type NftOptions = {
  tokenURI?: string;
  mediaURI?: string;
  meta?: NftToken["meta"];
};

// Nft metadata, denormalize to avoid double fetching, and referencing
class NftMetadata {
  // unique nft id = contractAddress + tokenid, doesn't differentiate between lending/renting
  id: string;
  nId: string;
  nftAddress: Address;
  tokenId: string;
  isERC721: boolean;
  _meta: NftToken["meta"] | undefined;
  mediaURI = "";
  tokenURI = "";
  isVerified = false;
  openseaURI = "";
  raribleURI = "";

  constructor(
    nftAddress: Address,
    tokenId: string,
    isERC721: boolean,
    options?: NftOptions
  ) {
    this.nftAddress = nftAddress;
    this.tokenId = tokenId;
    this.isERC721 = isERC721;
    this._meta = options?.meta;
    this.mediaURI = options?.mediaURI || "";
    this.tokenURI = options?.tokenURI || "";
    this.id = getUniqueID(nftAddress, tokenId);
    this.nId = getUniqueID(nftAddress, tokenId);
  }
}

class Lending {
  id: string;
  //nftId
  nId: string;
  // rentingId
  rentingId?: string;
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
  hasRenting: boolean;
  renterAddress: string;

  constructor(lendingRaw: LendingRaw) {
    this.nId = getUniqueID(lendingRaw.nftAddress, lendingRaw.tokenId);
    this.id = lendingRaw.id;

    const lending = parseLending(lendingRaw);
    this.nftAddress = lending.nftAddress;
    this.tokenId = lending.tokenId;
    this.lentAmount = lending.lentAmount;
    this.lenderAddress = lending.lenderAddress;
    this.maxRentDuration = lending.maxRentDuration;
    this.dailyRentPrice = lending.dailyRentPrice;
    this.nftPrice = lending.nftPrice;
    this.paymentToken = lending.paymentToken;
    this.collateralClaimed = lending.collateralClaimed;
    this.isERC721 = lending.collateralClaimed;
    this.hasRenting = !!lendingRaw.renting;
    this.rentingId = lendingRaw.renting?.id
      ? `${this.id}:${lendingRaw.renting.id}`
      : undefined;
    this.renterAddress = lendingRaw.renting?.renterAddress || "";
  }
}

class Renting {
  id: string;
  //nftId
  nId: string;
  nftAddress: Address;
  tokenId: string;
  isERC721: boolean;

  //lendingId
  lendingId: string;
  renterAddress: Address;
  rentDuration: number;
  rentedAt: number;
  rentAmount: string;
  paymentToken: PaymentToken;
  dailyRentPrice: number;
  nftPrice: number;
  rentalEndTime: number;

  constructor(
    nftAddress: Address,
    tokenId: string,
    lending: ILending,
    rentingRaw: RentingRaw
  ) {
    this.nId = getUniqueID(nftAddress, tokenId);
    this.nftAddress = nftAddress;
    this.tokenId = tokenId;
    this.isERC721 = lending.isERC721;
    this.lendingId = lending.id;
    //fix for rentingId having the same format as lendingId
    this.id = `${this.lendingId}:${rentingRaw.id}`;
    const renting = parseRenting(rentingRaw, {
      ...lending,
      renting: undefined,
    });
    this.renterAddress = renting.renterAddress;
    this.rentDuration = renting.rentDuration;
    this.rentedAt = renting.rentedAt;
    this.rentAmount = lending.lentAmount;
    this.paymentToken = lending.paymentToken;
    this.dailyRentPrice = lending.dailyRentPrice;
    this.nftPrice = lending.nftPrice;
    this.rentalEndTime =
      renting.rentedAt * 1000 + renting.rentDuration * 24 * 60 * 60 * 1000;
  }
}

export { NftMetadata as Nft, Lending, Renting };
