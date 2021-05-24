import { useContext, useEffect, useState } from "react";
import { SignerContext } from "../../../hardhat/SymfoniContext";
import { FetchType, fetchUserProd1155 } from "../../../services/graph";
import { CurrentAddressContextWrapper } from "../../CurrentAddressContextWrapper";
import { Nft } from "../classes";

export const useFetchERC1155 = (): { ERC1155: Nft[]; isLoading: boolean } => {
  const [currentAddress] = useContext(CurrentAddressContextWrapper);
  const [signer] = useContext(SignerContext);
  // TODO:eniko use cacheProvider or similar
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAndCreate() {
      if (!signer) return;
      if (!currentAddress) return;
      setLoading(true);
      //TODO:eniko current limitation is 5000 items for ERC1155
      const usersNfts1155 = await Promise.all([
        fetchUserProd1155(currentAddress, 0),
        fetchUserProd1155(currentAddress, 1),
        fetchUserProd1155(currentAddress, 2),
        fetchUserProd1155(currentAddress, 3),
        fetchUserProd1155(currentAddress, 4),
      ])
        .then(([arr1, arr2, arr3, arr4, arr5]) => {
          return Promise.resolve([...arr1, ...arr2, ...arr3, ...arr4, ...arr5]);
        })
        .then((result) => {
          return result.map((nft) => {
            return new Nft(
              nft.address,
              nft.tokenId,
              "0",
              nft.isERC721,
              signer,
              {
                meta: nft.meta,
                tokenURI: nft.tokenURI,
              }
            );
          });
        });
      setLoading(false);
      setNfts(usersNfts1155);
    }
    fetchAndCreate();
  }, [signer, currentAddress]);

  return { ERC1155: nfts, isLoading };
};
