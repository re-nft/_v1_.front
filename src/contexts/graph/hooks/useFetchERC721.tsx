import { useContext, useEffect, useState } from "react";
import { FetchType, fetchUserProd721 } from "../../../services/graph";
import createCancellablePromise from "../../create-cancellable-promise";
import { CurrentAddressWrapper } from "../../CurrentAddressWrapper";
import UserContext from "../../UserProvider";
import { Nft } from "../classes";
import { NftToken } from "../types";

export const useFetchERC721 = (): { ERC721: Nft[]; isLoading: boolean } => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const {signer} = useContext(UserContext);
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAndCreate() {
      if (!signer) return;
      if (!currentAddress) return;
      setLoading(false);
      //TODO:eniko current limitation is 5000 items for ERC721
      const usersNfts721 = await Promise.allSettled([
        fetchUserProd721(currentAddress, 0),
        fetchUserProd721(currentAddress, 1),
        fetchUserProd721(currentAddress, 2),
        fetchUserProd721(currentAddress, 3),
        fetchUserProd721(currentAddress, 4),
      ]).then((r) => {
        return r
          .reduce<NftToken[]>((acc, v) => {
            if (v.status === "fulfilled") {
              acc = [...acc, ...v.value];
            }
            return acc;
          }, [])
          .map((nft) => {
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

      setNfts(usersNfts721);
      setLoading(false);
    }
    const fetchRequest = createCancellablePromise(fetchAndCreate());
    return fetchRequest.cancel;
  }, [signer, currentAddress]);

  return { ERC721: nfts, isLoading };
};
