import { Address } from "../../types";
import { LendingRaw, RentingRaw, ILending, IRenting, NftToken } from "./types";
import { parseLending, parseRenting } from "./utils";


enum NftType {
  Nft,
  Lending,
  Renting
}

type NftOptions = {
  tokenURI?: string;
  mediaURI?: string;
  meta?: NftToken["meta"];
};

class Nft {
  type = NftType.Nft;
  nftAddress: Address;
  address: Address;
  tokenId: string;
  amount: string;
  isERC721: boolean;
  _meta: NftToken["meta"] | undefined;
  mediaURI: string;
  tokenURI: string;
  [k: string]: unknown;

  constructor(
    nftAddress: Address,
    tokenId: string,
    amount: string,
    isERC721: boolean,
    options?: NftOptions
  ) {
    this.address = nftAddress;
    this.nftAddress = nftAddress;
    this.tokenId = tokenId;
    this.amount = amount;

    this.isERC721 = isERC721;

    this._meta = options?.meta;
    this.mediaURI = options?.mediaURI ?? "";
    this.tokenURI = options?.tokenURI ?? "";
  }
}

class Lending extends Nft {
  type = NftType.Lending;
  lending: ILending;
  renting?: IRenting;
  id: string;

  constructor(lendingRaw: LendingRaw, options?: NftOptions) {
    super(
      lendingRaw.nftAddress,
      lendingRaw.tokenId,
      lendingRaw.lentAmount,
      lendingRaw.isERC721,
      options
    );

    this.lending = parseLending(lendingRaw);
    this.id = lendingRaw.id;

    if (lendingRaw.renting) {
      this.renting = parseRenting(lendingRaw.renting, this.lending);
    }
  }
}

class Renting extends Nft {
  type = NftType.Renting;
  lending: ILending;
  renting: IRenting;
  id: string;

  constructor(
    nftAddress: Address,
    tokenId: string,
    lending: ILending,
    rentingRaw: RentingRaw,
    options?: NftOptions
  ) {
    super(nftAddress, tokenId, lending.lentAmount, lending.isERC721, options);

    this.lending = lending;
    this.renting = parseRenting(rentingRaw, lending);
    this.id = rentingRaw.id;
  }
}


// typeguard for Lending class
export const isLending = (x: any): x is Lending => {
  if ("type" in x) {
    return x.type === NftType.Lending;
  }
  return false;
};

// typeguard for Renting class
export const isRenting = (x: any): x is Renting => {
  if ("type" in x) {
    return x.type === NftType.Renting;
  }
  return false;
};

/* eslint-disable-next-line */
export const isNft = (x: any): x is Nft => {
  if ("type" in x) {
    return x.type === NftType.Nft;
  }
  return false;
};

export { Nft, Lending, Renting };
