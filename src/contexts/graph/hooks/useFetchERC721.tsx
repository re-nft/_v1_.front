import { useContext, useEffect, useState } from "react";
import { SignerContext } from "../../../hardhat/SymfoniContext";
import { FetchType, fetchUserProd721 } from "../../../services/graph";
import { CurrentAddressContextWrapper } from "../../CurrentAddressContextWrapper";
import { Nft } from "../classes";

export const useFetchERC721 = (): { ERC721: Nft[]; isLoading: boolean } => {
  const [currentAddress] = useContext(CurrentAddressContextWrapper);
  const [signer] = useContext(SignerContext);
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAndCreate() {
      if (!signer) return;
      if (!currentAddress) return;
      setLoading(false);
      //TODO:eniko current limitation is 5000 items for ERC721
      const usersNfts721 = await Promise.all([
        fetchUserProd721(currentAddress, 0),
        fetchUserProd721(currentAddress, 1),
        fetchUserProd721(currentAddress, 2),
        fetchUserProd721(currentAddress, 3),
        fetchUserProd721(currentAddress, 4),
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
      setNfts(usersNfts721);
    }
    fetchAndCreate();
  }, [signer, currentAddress]);

  return { ERC721: nfts, isLoading };
};
