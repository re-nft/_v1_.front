import { useContext, useCallback } from "react";

import { BigNumber, ethers } from "ethers";

import {
  MyERC721Context,
  MyERC1155Context,
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

  const { instance: myERC721 } = useContext(MyERC721Context);
  const { instance: myERC1155 } = useContext(MyERC1155Context);

  const fetchNftDev = useCallback(async () => {
    if (!myERC1155 || !myERC721 || !renft || !signer) return [];
    
    const toFetch: Promise<Response>[] = [];
    const tokenIds: string[] = [];
    const usersNfts: Omit<NftToken, "tokenURI">[] = [];
    const erc1155Ids = [1000, 1001, 1002, 1003, 1004];

    const numNfts721 = await myERC721
      .balanceOf(currentAddress)
      .catch(() => BigNumZero);

    const myNfts1155 = await myERC1155
      .balanceOfBatch(Array(erc1155Ids.length).fill(currentAddress), erc1155Ids)
      .catch(() => []);

    for (let i = 0; i < numNfts721.toNumber(); i++) {
      const tokenId = await myERC721.tokenOfOwnerByIndex(currentAddress, i);
      const metaURI = await myERC721.tokenURI(tokenId);

      usersNfts.push({
        address: myERC721.address,
        tokenId: tokenId.toString(),
      });
      tokenIds.push(tokenId.toString());
      toFetch.push(
        fetch(metaURI, {
          headers: [["Content-Type", "text/plain"]],
        })
          .then(async (dat) => await dat.json())
          .catch(() => { console.warn('could not fetch metaURI') })
      );
    }
  
    // TODO: fix all the ts-ignores

    const _meta = await Promise.all(toFetch);

    const usersDevNfts: Nft[] = [];
    for (let i = 0; i < _meta.length; i++) {
      usersDevNfts.push(
        new Nft(myERC721.address, tokenIds[i], signer, {
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
  }, [renft, currentAddress, myERC721, myERC1155, signer]);

  return fetchNftDev;
};

export default useFetchNftDev;
