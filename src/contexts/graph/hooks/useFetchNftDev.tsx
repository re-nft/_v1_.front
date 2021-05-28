import { useContext, useEffect, useMemo, useState } from "react";

import { BigNumber, ethers, Signer } from "ethers";
import { IS_PROD } from "../../../consts";
import { NftToken } from "../../graph/types";
import { Nft } from "../../graph/classes";
import { CurrentAddressWrapper } from "../../CurrentAddressWrapper";
import fetch from "cross-fetch";
import UserContext from "../../UserProvider";
import { E1155__factory } from "../../../hardhat/typechain/factories/E1155__factory";
import { E721__factory } from "../../../hardhat/typechain/factories/E721__factory";

const BigNumZero = BigNumber.from("0");

export const useFetchNftDev = (): Nft[] => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { signer, web3Provider } = useContext(UserContext);
  const [devNfts, setDevNfts] = useState<Nft[]>([]);

  const e721 = useMemo(() => {
    if (!signer) return;
    if (!web3Provider) return;

    return getE721(web3Provider, signer);
  }, [signer, web3Provider]);

  const e1155 = useMemo(() => {
    if (!signer) return;
    if (!web3Provider) return;

    return getE1155(web3Provider, signer);
  }, [signer, web3Provider]);

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

const getE1155 = (_provider: ethers.providers.Provider, _signer?: Signer) => {
  if (IS_PROD) return;
  if (!process.env.REACT_APP_E1155_ADDRESS)
    throw new Error("Please provide REACT_APP_E1155_ADDRESS");
  const contractAddress = process.env.REACT_APP_E1155_ADDRESS;
  return _signer
    ? E1155__factory.connect(contractAddress, _signer)
    : E1155__factory.connect(contractAddress, _provider);
};

const getE721 = (_provider: ethers.providers.Provider, _signer?: Signer) => {
  if (IS_PROD) return;
  if (!process.env.REACT_APP_E721_ADDRESS)
    throw new Error("Please provide REACT_APP_E721_ADDRESS");
  const contractAddress = process.env.REACT_APP_E721_ADDRESS;
  return _signer
    ? E721__factory.connect(contractAddress, _signer)
    : E721__factory.connect(contractAddress, _provider);
};
export default useFetchNftDev;
