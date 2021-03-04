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

class Nft {
  constructor(nftAddress: Address, tokenId: string) {
    this.address = nftAddress;
    this.tokenId = tokenId;
    true;
  }
  address: Address;
  tokenId: string;
  contract = (): ERC721 | ERC1155 => {
    return {} as ERC721;
  };
  tokenURI = async (): Promise<string | null> => {
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
  mediaURI = async (): Promise<string | null> => {
    return "";
  };
}

class Lending extends Nft {
  constructor(nftAddress: Address, tokenId: string, lendingRaw: LendingRaw) {
    super(nftAddress, tokenId);

    this.lending = parseLending(lendingRaw);
    this.id = lendingRaw.id;
  }
  lending: LendingType;
  id: string;
}

class Renting extends Nft {
  constructor(nftAddress: Address, tokenId: string, rentingRaw: RentingRaw) {
    super(nftAddress, tokenId);

    this.renting = parseRenting(rentingRaw);
    this.id = rentingRaw.id;
  }
  renting: RentingType;
  id: string;
}

export { Nft, Lending, Renting };
