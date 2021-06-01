import { useContext, useEffect, useMemo, useState } from "react";
import { getUniqueID } from "../../../controller/batch-controller";
import { SignerContext } from "../../../hardhat/SymfoniContext";
import { fetchUserProd1155 } from "../../../services/graph";
import createCancellablePromise from "../../create-cancellable-promise";
import { CurrentAddressWrapper } from "../../CurrentAddressWrapper";
import { Nft } from "../classes";
import { NftToken } from "../types";

export const useFetchERC1155 = (): { ERC1155: Nft[]; isLoading: boolean } => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const [signer] = useContext(SignerContext);

  // TODO:eniko use cacheProvider or similar
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoading, setLoading] = useState(false);

  const ids = useMemo(() => {
    return new Set(nfts.map((nft) => getUniqueID(nft.nftAddress, nft.tokenId)));
  }, [nfts]);

  useEffect(() => {
    async function fetchAndCreate() {
      if (!signer) return;
      if (!currentAddress) return;
      setLoading(true);
      //TODO:eniko current limitation is 5000 items for ERC1155
      const result = await Promise.allSettled([
        fetchUserProd1155(currentAddress, 0),
        fetchUserProd1155(currentAddress, 1),
        fetchUserProd1155(currentAddress, 2),
        fetchUserProd1155(currentAddress, 3),
        fetchUserProd1155(currentAddress, 4),
      ]).then((r) => {
        return r.reduce<NftToken[]>((acc, v) => {
          if (v.status === "fulfilled") {
            acc = [...acc, ...v.value];
          }
          return acc;
        }, []);
      });

      const usersNfts1155 = result // filter out duplicates
        .filter((nft) => !ids.has(getUniqueID(nft.address, nft.tokenId)))
        .map((nft) => {
          return new Nft(nft.address, nft.tokenId, "0", nft.isERC721, signer, {
            meta: nft.meta,
            tokenURI: nft.tokenURI,
          });
        });
      if (usersNfts1155.length > 0) {
        setNfts([...usersNfts1155, ...nfts]);
      }
      setLoading(false);
    }
    const fetchRequest = createCancellablePromise(fetchAndCreate());
    return fetchRequest.cancel;
  }, [signer, currentAddress, ids, nfts]);

  return { ERC1155: nfts, isLoading };
};
