import { Address } from "../../types";
import { ERC721 } from "../../hardhat/typechain/ERC721";
import { ERC1155 } from "../../hardhat/typechain/ERC1155";
import { LendingRaw, RentingRaw, ILending, IRenting, NftToken } from "./types";
import { parseLending, parseRenting } from "./utils";
import { BigNumber, ethers } from "ethers";
import { ERC721__factory } from "../../hardhat/typechain/factories/ERC721__factory";
import { ERC1155__factory } from "../../hardhat/typechain/factories/ERC1155__factory";

type NftOptions = {
  tokenURI?: string;
  mediaURI?: string;
  meta?: NftToken["meta"];
};

class Nft {
  constructor(
    nftAddress: Address,
    tokenId: string | BigNumber,
    amount: string | BigNumber,
    isERC721: boolean,
    signer: ethers.Signer,
    options?: NftOptions
  ) {
    this.address = nftAddress;
    this.nftAddress = nftAddress;
    this.tokenId = tokenId.toString();
    this.amount = amount.toString();
    this.signer = signer;
    this.isERC721 = isERC721;

    this._meta = options?.meta;

    if (!options?.tokenURI) {
      const _contract = this.contract();
      /* eslint-disable-next-line */
      const uriSelector = isERC721 ? _contract.tokenURI : _contract.uri;

      
      uriSelector(this.tokenId)
        .then((d: any) => {
          this._tokenURI = d;
        })
        .catch((e:any) => {
          console.log(e)
          console.warn(
            "could not fetch tokenURI",
            this.address,
            "tokenID",
            this.tokenId
          );
        });
    }

    this._tokenURI = options?.tokenURI ?? "";
    this._mediaURI = options?.mediaURI ?? "";
  }

  nftAddress: Address;
  address: Address;
  tokenId: string;
  amount: string;
  signer: ethers.Signer;
  isERC721: boolean;
  _meta: NftToken["meta"] | undefined;
  _tokenURI: string;
  _mediaURI: string;
  _contract: ERC721 | ERC1155 | undefined;

  /**
   * If previously instantiated, will return that instance, otherwise, will instantiate
   * a contract for you
   * @returns ERC721 or ERC1155 instance that can be signed by the currentAddress
   */
  contract = (): ERC721 | ERC1155 => {
    if (this._contract) return this._contract;

    const instantiator = this.isERC721 ? ERC721__factory : ERC1155__factory;
    const _contract: ERC721 | ERC1155 = instantiator.connect(
      this.address,
      this.signer
    );
    this._contract = _contract;
    return _contract;
  };

  loadTokenURI = async (): Promise<string | undefined> => {
    if (this._tokenURI) return this._tokenURI;
    if (!this._contract) this.contract();

    try {
      if (this.isERC721) {
        return await this.contract().tokenURI(
          ethers.BigNumber.from(this.tokenId)
        );
      } else {
        return await this.contract().uri();
      }
    } catch (err) {
      console.warn("loadTokenURI error");
    }
  };
}

// typeguard for Lending class
export const isLending = (x: any): x is Lending => {
  return "lending" in x;
};

class Lending extends Nft {
  constructor(
    lendingRaw: LendingRaw,
    signer: ethers.Signer,
    options?: NftOptions
  ) {
    super(
      lendingRaw.nftAddress,
      lendingRaw.tokenId,
      lendingRaw.amount,
      lendingRaw.isERC721,
      signer,
      options
    );

    this.lending = parseLending(lendingRaw);
    this.id = lendingRaw.id;
  }
  lending: ILending;
  id: string;
}

class Renting extends Nft {
  constructor(
    nftAddress: Address,
    tokenId: string,
    amount: string,
    signer: ethers.Signer,
    rentingRaw: RentingRaw,
    options?: NftOptions
  ) {
    super(nftAddress, tokenId, amount, rentingRaw.isERC721, signer, options);

    this.renting = parseRenting(rentingRaw);
    this.id = rentingRaw.id;
  }
  renting: IRenting;
  id: string;
}

export { Nft, Lending, Renting };
