import { Address } from "../../types";
import { ERC721 } from "../../hardhat/typechain/ERC721";
import { ERC1155 } from "../../hardhat/typechain/ERC1155";
import {
  LendingRaw,
  RentingRaw,
  Lending as LendingType,
  Renting as RentingType,
} from "./types";
import { parseLending, parseRenting } from "./utils";

type NftOptions = {
  tokenURI?: string;
};

class Nft {
  constructor(nftAddress: Address, tokenId: string, options?: NftOptions) {
    this.address = nftAddress;
    this.tokenId = tokenId;

    if (options?.tokenURI) {
      this._tokenURI = options?.tokenURI;
    }
  }
  address: Address;
  tokenId: string;
  _tokenURI: string | undefined;
  contract = (): ERC721 | ERC1155 => {
    return {} as ERC721;
  };
  tokenURI = async (): Promise<string | undefined> => {
    if (this._tokenURI) return this._tokenURI;
    return "";
  };

  // todo: look at the meta definition
  // todo: https://github.com/ethereum/eips/issues/721#issuecomment-343246872
  // todo: there is another link, not this one
  /**
   * This is parsed tokenURI is JSON
   */
  meta = async (): Promise<any> => {
    return {};
  };
  /**
   * This is image from meta or from tokenURI. Sometimes,
   * tokenURI directly gives a link to media, instead of
   * meta...
   */
  mediaURI = async (): Promise<string | undefined> => {
    return "";
  };
}

class Lending extends Nft {
  constructor(
    nftAddress: Address,
    tokenId: string,
    lendingRaw: LendingRaw,
    options?: NftOptions
  ) {
    super(nftAddress, tokenId, options);

    this.lending = parseLending(lendingRaw);
    this.id = lendingRaw.id;
  }
  lending: LendingType;
  id: string;
}

class Renting extends Nft {
  constructor(
    nftAddress: Address,
    tokenId: string,
    rentingRaw: RentingRaw,
    options?: NftOptions
  ) {
    super(nftAddress, tokenId, options);

    this.renting = parseRenting(rentingRaw);
    this.id = rentingRaw.id;
  }
  renting: RentingType;
  id: string;
}

export { Nft, Lending, Renting };
