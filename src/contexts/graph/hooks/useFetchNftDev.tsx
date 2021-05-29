import { useContext, useEffect, useState } from "react";

import { BigNumber } from "ethers";
import { IS_PROD } from "../../../consts";
import { NftToken } from "../../graph/types";
import { Nft } from "../../graph/classes";
import { CurrentAddressWrapper } from "../../CurrentAddressWrapper";
import fetch from "cross-fetch";
import {
  E1155Context,
  E721Context,
  SignerContext,
} from "../../../hardhat/SymfoniContext";

const BigNumZero = BigNumber.from("0");

export const useFetchNftDev = (): Nft[] => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { instance: e721 } = useContext(E721Context);
  const { instance: e1155 } = useContext(E1155Context);
  const [signer] = useContext(SignerContext);
  const [devNfts, setDevNfts] = useState<Nft[]>([]);

  useEffect(() => {
    const fetchAsync = async () => {
      if (IS_PROD) return;
      if (!e1155 || !e721 || !signer || !currentAddress) return [];

      const toFetch: Promise<Response>[] = [];
      const tokenIds: string[] = [];
      const usersNfts: Omit<NftToken, "tokenURI">[] = [];
      const erc1155Ids = [1000, 1001, 1002, 1003, 1004];

      const num721s = await e721
        .balanceOf(currentAddress)
        .catch(() => BigNumZero);
      const num1155s = await e1155
        .balanceOfBatch(
          Array(erc1155Ids.length).fill(currentAddress),
          erc1155Ids
        )
        .catch(() => []);

      for (let i = 0; i < num721s.toNumber(); i++) {
        try {
          const tokenId = await e721.tokenOfOwnerByIndex(
            currentAddress,
            String(i)
          );
          const metaURI = await e721.tokenURI(tokenId.toString());

          usersNfts.push({
            address: e721.address,
            tokenId: tokenId.toString(),
            isERC721: true,
          });

          tokenIds.push(tokenId.toString());
          const fetched = fetch(metaURI).then(async (d) => await d.json());
          toFetch.push(fetched);
        } catch (e) {
          console.debug(
            "most likely tokenOfOwnerByIndex does not work. whatever, this is not important"
          );
        }
      }

      // TODO: fix all the ts-ignores
      const _meta = await Promise.all(toFetch);

      const usersDevNfts: Nft[] = [];
      const isERC721 = true;
      for (let i = 0; i < _meta.length; i++) {
        usersDevNfts.push(
          new Nft(e721.address, tokenIds[i], "1", isERC721, signer, {
            // @ts-ignore
            mediaURI: _meta[i]?.["image"] ?? "",
            // @ts-ignore
            name: _meta[i]?.["name"] ?? "",
          })
        );
      }

      for (let i = 0; i < num1155s.length; i++) {
        const tokenURI = await e1155.uri(erc1155Ids[i]).catch(() => {
          console.warn("could not fetch user dev 1155 tokenURI");
          return "";
        });
        const amountBalance = await e1155.balanceOf(
          currentAddress,
          // @ts-ignore
          erc1155Ids[i]
        );

        if (num1155s[i].toNumber() > 0) {
          usersDevNfts.push(
            new Nft(
              e1155.address,
              erc1155Ids[i].toString(),
              amountBalance,
              !isERC721,
              signer,
              {
                tokenURI: `${tokenURI}${i + 10}`,
              }
            )
          );
        }
      }
      // TODO:eniko optimization
      setDevNfts(usersDevNfts);
    };
    fetchAsync();
  }, [currentAddress, e721, e1155, signer]);

  return devNfts;
};
