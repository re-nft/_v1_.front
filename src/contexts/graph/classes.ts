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
import { ethers } from "ethers";
import { ERC721__factory } from "../../hardhat/typechain/factories/ERC721__factory";
import { ERC1155__factory } from "../../hardhat/typechain/factories/ERC1155__factory";

type NftOptions = {
  tokenURI?: string;
  mediaURI?: string;
  name?: string;
};

class Nft {
  constructor(
    nftAddress: Address,
    tokenId: string,
    signer: ethers.Signer,
    options?: NftOptions
  ) {
    this.address = nftAddress;
    this.tokenId = tokenId;
    this.signer = signer;
    this.isERC721 = false;

    this.name = options?.name ?? "";
    this._tokenURI = options?.tokenURI ?? "";
    this._mediaURI = options?.mediaURI ?? "";
  }

  address: Address;
  tokenId: string;
  signer: ethers.Signer;
  isERC721: boolean;
  name: string;
  _tokenURI: string;
  _mediaURI: string;
  _contract: ERC721 | ERC1155 | undefined;

  contract = (): ERC721 | ERC1155 => {
    if (this._contract) return this._contract;
    // todo: not exactly sure if this will work
    try {
      const __contract = ERC721__factory.connect(this.address, this.signer);
      this.isERC721 = true;
      this._contract = __contract;
      return __contract;
    } catch {
      const __contract = ERC1155__factory.connect(this.address, this.signer);
      this._contract = __contract;
      return __contract;
    }
  };

  tokenURI = async (): Promise<string | undefined> => {
    if (this._tokenURI) return this._tokenURI;
    if (!this._contract) this.contract();
    if (this.isERC721) {
      return await this.contract().tokenURI();
    } else {
      return `${await this.contract().uri()}/${this.tokenId}`;
    }
  };

  // todo: look at the meta definition
  // todo: https://github.com/ethereum/eips/issues/721#issuecomment-343246872
  // todo: there is another link, not this one
  // todo: also, we need this https://github.com/0xsequence/collectible-lists
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
    if (this._mediaURI) return this._mediaURI;
    // todo: ipfs
    return "";
  };
}

class Lending extends Nft {
  constructor(
    nftAddress: Address,
    tokenId: string,
    signer: ethers.Signer,
    lendingRaw: LendingRaw,
    options?: NftOptions
  ) {
    super(nftAddress, tokenId, signer, options);

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
    signer: ethers.Signer,
    rentingRaw: RentingRaw,
    options?: NftOptions
  ) {
    super(nftAddress, tokenId, signer, options);

    this.renting = parseRenting(rentingRaw);
    this.id = rentingRaw.id;
  }
  renting: RentingType;
  id: string;
}

export { Nft, Lending, Renting };
