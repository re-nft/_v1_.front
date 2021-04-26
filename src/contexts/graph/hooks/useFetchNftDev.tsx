import { useContext, useCallback } from "react";

import { BigNumber, ethers } from "ethers";

import {
  MyERC721Context,
  MyERC1155Context,
  CurrentAddressContext,
  ReNFTContext,
} from "../../../hardhat/SymfoniContext";
import { NftToken } from "../../graph/types";
import { Nft } from "../../graph/classes";

const BigNumZero = BigNumber.from("0");

export const useFetchNftDev = (
  signer?: ethers.Signer
): (() => Promise<Nft[]>) => {
  const [currentAddress] = useContext(CurrentAddressContext);
  const renft = useContext(ReNFTContext);

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
        isERC721: true,
      });
      tokenIds.push(tokenId.toString());
      toFetch.push(
        fetch(`${metaURI}`)
          .then(async (dat) => await dat.json())
          .catch(() => {
            console.warn("could not fetch metaURI");
          })
      );
    }

    // TODO: fix all the ts-ignores

    const _meta = await Promise.all(toFetch);

    const usersDevNfts: Nft[] = [];
    const isERC721 = true;
    for (let i = 0; i < _meta.length; i++) {
      usersDevNfts.push(
        new Nft(myERC721.address, tokenIds[i], isERC721, signer, {
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
      usersDevNfts.push(
        new Nft(
          myERC1155.address,
          myNfts1155[i].toString(),
          !isERC721,
          signer,
          {
            tokenURI: tokenURI,
          }
        )
      );
    }

    return usersDevNfts;
  }, [renft, currentAddress, myERC721, myERC1155, signer]);

  return fetchNftDev;
};

export default useFetchNftDev;
