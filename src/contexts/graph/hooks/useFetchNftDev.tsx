import { useContext, useCallback } from "react";

import { BigNumber, ethers } from "ethers";

import {
  E721Context,
  E1155Context,
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
  const { instance: e721 } = useContext(E721Context);
  const { instance: e1155 } = useContext(E1155Context);

  const fetchNftDev = useCallback(async () => {
    if (!e1155 || !e721 || !renft || !signer) return [];

    const toFetch: Promise<Response>[] = [];
    const tokenIds: string[] = [];
    const usersNfts: Omit<NftToken, "tokenURI">[] = [];
    const erc1155Ids = [1000, 1001, 1002, 1003, 1004];

    const num721s = await e721
      .balanceOf(currentAddress)
      .catch(() => BigNumZero);
    const num1155s = await e1155
      .balanceOfBatch(Array(erc1155Ids.length).fill(currentAddress), erc1155Ids)
      .catch(() => []);

    console.log("num721s", num721s.toString());
    console.log("num1155s", num1155s.toString());

    console.log(
      "balance of currentAddress",
      (await e721.balanceOf(currentAddress)).toString()
    );

    for (let i = 0; i < num721s.toNumber(); i++) {
      console.log("loop #", i);
      console.log(
        "querying tokenOfOwnerByIndex, currentAddress",
        currentAddress
      );

      const tokenId = await e721.tokenOfOwnerByIndex(currentAddress, String(i));

      console.log("pulled tokenId", tokenId.toString());

      console.log(e721);
      console.log(await e721["tokenURI(uint256)"](1));

      const metaURI = await e721.tokenURI(tokenId.toString());

      // TODO: this is the problem place. It returns an empty metaURI, even though should not!
      // TODO: after you run: yarn chain
      // TODO: run `yarn hardhat --network localhost console` in packages/contracts
      // TODO: you can pull the contract's instance with e721 = await ethers.getContract('E721')
      // TODO: and then run await e721.tokenURI(1) and you will see that it returns the meta uris
      // TODO: however, here, SymfoniContext is returning empty strings...

      console.log("* metaURI", metaURI);

      usersNfts.push({
        address: e721.address,
        tokenId: tokenId.toString(),
        isERC721: true,
      });

      tokenIds.push(tokenId.toString());
      const fetched = fetch(metaURI).then(async (d) => await d.json());
      toFetch.push(fetched);
    }

    // TODO: fix all the ts-ignores
    const _meta = await Promise.all(toFetch);

    console.log("_meta", _meta);

    const usersDevNfts: Nft[] = [];
    const isERC721 = true;
    for (let i = 0; i < _meta.length; i++) {
      usersDevNfts.push(
        new Nft(e721.address, tokenIds[i], isERC721, signer, {
          // @ts-ignore
          mediaURI: _meta[i]?.["image"] ?? "",
          // @ts-ignore
          name: _meta[i]?.["name"] ?? "",
        })
      );
    }

    for (let i = 0; i < num1155s.length; i++) {
      const tokenURI = await e1155.uri(erc1155Ids[i]);
      if (num1155s[i].toNumber() > 0) {
        usersDevNfts.push(
          new Nft(e1155.address, erc1155Ids[i].toString(), !isERC721, signer, {
            tokenURI: tokenURI,
          })
        );
      }
    }

    return usersDevNfts;
  }, [renft, currentAddress, e721, e1155, signer]);

  return fetchNftDev;
};

export default useFetchNftDev;
