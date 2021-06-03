import { useContext, useEffect, useMemo, useState } from "react";
import { getUniqueCheckboxId } from "../../../controller/batch-controller";
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
  const [isLoading, setLoading] = useState(true);

  const ids = useMemo(() => {
    return new Set(nfts.map((nft) => getUniqueCheckboxId(nft as Nft)));
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
      // TODO update if renting/lending changed
      const usersNfts1155 = result // filter out duplicates
        .filter((nft) => !ids.has(getUniqueCheckboxId(nft as Nft)))
        .map((nft) => {
          return new Nft(nft.address, nft.tokenId, "0", nft.isERC721, signer, {
            meta: nft.meta,
            tokenURI: nft.tokenURI,
          });
        });
      const items: Nft[] = [];
      const resultIds = new Set<string>();
      usersNfts1155.forEach((nft) => {
        const id = getUniqueCheckboxId(nft as Nft);
        if (!resultIds.has(id)) {
          items.push(nft);
          resultIds.add(id);
        }
      });
      if (items.length > 0) {
        setNfts([...items, ...nfts]);
      }
      setLoading(false);
    }
    const fetchRequest = createCancellablePromise(fetchAndCreate());
    return fetchRequest.cancel;
  }, [signer, currentAddress, ids, nfts]);

  return { ERC1155: nfts, isLoading };
};
