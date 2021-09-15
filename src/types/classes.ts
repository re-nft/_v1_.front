import { getUniqueID, parseLending, parseRenting } from "../utils";
import { LendingRaw, RentingRaw, ILending, IRenting, NftToken, Address } from ".";

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

class Nft {
  type = NftType.Nft;
  // unique id, is different for nft/lending/renting
  id: string;
  // unique nft id = contractAddress + tokenid, doesn't differentiate between lending/renting
  nId: string;
  nftAddress: Address;
  address: Address;
  tokenId: string;
  amount: string;
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
    if (options?.mediaURI) {
      this.mediaURI = options.mediaURI;
    }
    if (options?.tokenURI) {
      this.tokenURI = options.tokenURI;
    }
    //TODO:eniko check if we still need to do this
    this.id = getUniqueID(nftAddress, tokenId, "0");
    this.nId = getUniqueID(nftAddress, tokenId);
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
      this.renting = parseRenting(lendingRaw.renting, {...this.lending, renting: undefined});
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
    this.renting = parseRenting(rentingRaw, {...this.lending, renting: undefined});
    this.id = rentingRaw.id;
  }
}

export { Nft, Lending, Renting };
