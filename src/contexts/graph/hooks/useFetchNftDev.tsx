import { useContext, useCallback } from "react";

import { BigNumber, ethers } from "ethers";

import {
  MyERC721Context,
  CurrentAddressContext,
  RentNftContext,
} from "../../../hardhat/SymfoniContext";
import { NftToken } from "../../graph/types";
import { Nft } from "../../graph/classes";

const BigNumZero = BigNumber.from("0");

export const useFetchNftDev = (
  signer?: ethers.Signer
): (() => Promise<Nft[]>) => {
  const [currentAddress] = useContext(CurrentAddressContext);
  const renft = useContext(RentNftContext);

  // * mock erc721 contract
  const myERC721 = useContext(MyERC721Context);
  // ! only used in dev environment - so don't worry about this too much
  const fetchNftDev = useCallback(async () => {
    if (!myERC721.instance || !renft.instance || !signer) return [];

    const toFetch: Promise<Response>[] = [];
    const tokenIds: string[] = [];
    const usersNfts: Omit<NftToken, "tokenURI">[] = [];

    // * only fetching ERC721s in dev right now
    // todo: add ERC1155s
    const contract = myERC721.instance;

    const numNfts = await contract
      .balanceOf(currentAddress)
      .catch(() => BigNumZero);

    if (numNfts.eq(BigNumZero)) return [];

    for (let i = 0; i < numNfts.toNumber(); i++) {
      // get the tokenId, and then fetch the metadata uri, then push this to toFetch
      const tokenId = await contract
        .tokenOfOwnerByIndex(currentAddress, i)
        .catch(() => -1);
      if (tokenId === -1) continue;

      const metaURI = await contract.tokenURI(tokenId).catch(() => "");
      if (!metaURI) continue;

      usersNfts.push({
        address: contract.address,
        tokenId: tokenId.toString(),
      });
      tokenIds.push(tokenId.toString());
      toFetch.push(
        fetch(metaURI, {
          headers: [["Content-Type", "text/plain"]],
        })
          .then(async (dat) => await dat.json())
          .catch(() => ({}))
      );
    }
    if (toFetch.length === 0) return [];

    const _meta = await Promise.all(toFetch);
    const usersDevNfts: Nft[] = [];
    for (let i = 0; i < _meta.length; i++) {
      usersDevNfts.push(
        new Nft(contract.address, tokenIds[i], signer, {
          // @ts-ignore
          mediaURI: _meta[i]?.["image"] ?? "",
          // @ts-ignore
          name: _meta[i]?.["name"] ?? "",
        })
      );
    }

    for (let i = 0; i < myNfts1155.length; i++) {
      if (!myNfts1155[i].gt(BigNumZero)) continue;
      const tokenURI = await myERC1155.uri(myNfts1155[i]);
      // {"external_url":"https://www.bondly.finance/","image":"https://api.bccg.digital/images/ARCA.png","name":"Arca (Thriller)","description":"Arca is an ex-spy.  She's part cybernetic and has incredible strength and agility. Prefers bladed weapons for stealthy quick kills.  ","attributes":[{"trait_type":"ARC","value":"Arca"},{"trait_type":"T","value":"Thriller"},{"trait_type":"1S","value":"First Edition"},{"trait_type":"Villain","value":"Villain"}]}
      usersDevNfts.push(
        new Nft(myERC1155.address, myNfts1155[i].toString(), signer, {
          tokenURI: tokenURI,
        })
      );
    }

    return usersDevNfts;
  }, [renft.instance, currentAddress, myERC721.instance, signer]);

  return fetchNftDev;
};

export default useFetchNftDev;
