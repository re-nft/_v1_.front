import React, { createContext, useState, useCallback, useEffect } from "react";
import {
  fetchNFTFromOtherSource,
  fetchNFTsFromOpenSea,
} from "../services/fetch-nft-meta";
import { nftId } from "../services/firebase";
import { Nft } from "./graph/classes";
import { NftToken } from "./graph/types";

type MetaType = NftToken["meta"] & { id: string };
type MetaArray = Array<MetaType>;
type MetaMap = Map<string, MetaType>;
const fetchMetas = (items: Nft[]) => {
  // nothing
};

export const NFTMetaContext = createContext<[MetaMap, typeof fetchMetas]>([
  new Map(),
  fetchMetas,
]);

export const NFTMetaProvider: React.FC = ({ children }) => {
  const [metas, setMetas] = useState<MetaMap>(new Map());
  const [fetchNotfounds, setFetchNotFounds] = useState<Nft[]>([]);
  const [fetching, setFetching] = useState<Nft[]>([]);

  const addMetas = useCallback(
    (items: MetaArray) => {
      const newMap = new Map(metas);
      let newItem = false;
      items.map((item) => {
        if (!newMap.has(item.id)) {
          newItem = true;
          newMap.set(item.id, item);
        }
      });
      if (newItem) {
        setMetas(newMap);
      }
    },
    [metas, setMetas]
  );
  const fetchNFTs = useCallback(
    (items: Nft[]) => {
      const fetchingItems = items.filter((nft) => {
        const key = nftId(nft.address, nft.tokenId);
        return !metas.has(key);
      });
      setFetching(fetchingItems);
    },
    [metas]
  );
  // TODO:eniko how to cancel
  useEffect(() => {
    const contractAddress: string[] = [];
    const tokenIds: string[] = [];
    fetching.map((nft) => {
      contractAddress.push(nft.nftAddress);
      tokenIds.push(nft.tokenId);
    });

    if (contractAddress.length > 0 && tokenIds.length > 0) {
      fetchNFTsFromOpenSea(contractAddress, tokenIds).then((data) => {
        const found = data.reduce((acc, nft) => {
          acc.add(nft.id);
          return acc;
        }, new Set());
        const notFounds = fetching.filter((nft) => {
          const key = `${nft.nftAddress}-${nft.tokenId}`;
          return !found.has(key);
        });
        setFetching([]);
        addMetas(data);
        setFetchNotFounds([...fetchNotfounds, ...notFounds]);
      });
    }
  }, [addMetas, fetchNotfounds, fetching]);

  useEffect(() => {
    // TODO:eniko cancel
    const promises = fetchNotfounds.map(fetchNFTFromOtherSource);
    Promise.allSettled(promises).then(
      // TODO:eniko any
      (values: any) => {
        const data = values.map((v: any) => v.value);
        addMetas(data);
      }
    );
  }, [addMetas, fetchNotfounds]);

  return (
    <NFTMetaContext.Provider value={[metas, fetchNFTs]}>
      {children}
    </NFTMetaContext.Provider>
  );
};
