import { useCallback, useEffect } from "react";
import {
  fetchNFTFromOtherSource,
  fetchNFTsFromOpenSea,
} from "../../services/fetch-nft-meta";
import { NftTokenMeta } from "../../types";
import create from "zustand";
import shallow from "zustand/shallow";
import { devtools } from "zustand/middleware";
import produce from "immer";
import { from, map, mergeMap } from "rxjs";
import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../../consts";
import { useNftsStore } from "./useNftStore";

interface MetaLoading extends NftTokenMeta {
  loading?: boolean;
}

type NftMetaState = {
  metas: Record<string, MetaLoading>;
  nfts: string[];
  keys: string[];
  fetchReadyOpenSea: string[];
  fetchReadyIPFS: string[];
  setFetchReady: (items: string[]) => void;
  setIPFSResult: (items: NftTokenMeta) => void;
  setOpenseaResult: (items: NftTokenMeta[], notFounds: string[]) => void;
};

const preloadImages = (metas: MetaLoading[]) => {
  metas.map((meta) => {
    const img = new Image();
    if (meta.image) img.src = meta.image;
  });
};

export const useNftMetaState = create<NftMetaState>(
  devtools(
    (set) => ({
      metas: {},
      keys: [],
      fetchReadyOpenSea: [],
      fetchReadyIPFS: [],
      nfts: [],
      setFetchReady: (fetching: string[]) =>
        set(
          produce((state) => {
            fetching.forEach((nId) => {
              if (!state.metas[nId]) {
                state.metas[nId] = {
                  nId: nId,
                  loading: true,
                };
                state.nfts.push(nId);
                state.fetchReadyOpenSea.push(nId);
              }
            });
          })
        ),
      setOpenseaResult: (founds: NftTokenMeta[], notFounds: string[]) =>
        set(
          produce((state) => {
            if (founds.length < 1 && notFounds.length < 1) return;
            founds.map((meta) => {
              state.metas[meta.nId].loading = false;
              state.metas[meta.nId].name = meta.name;
              state.metas[meta.nId].image = meta.image;
              state.metas[meta.nId].description = meta.description;
              state.metas[meta.nId].collection = meta.collection;
              state.metas[meta.nId].openseaLink = meta.openseaLink;
            });
            const foundSet = new Set(founds.map((f) => f.nId));
            state.fetchReadyOpenSea = state.fetchReadyOpenSea.filter(
              (n: NftTokenMeta) => !foundSet.has(n.nId)
            );
            state.fetchReadyIPFS = notFounds;
            state.keys.push(...founds.map((f) => f.nId));
          })
        ),
      setIPFSResult: (meta: NftTokenMeta) =>
        set(
          produce((state) => {

            state.metas[meta.nId].loading = false;
            state.metas[meta.nId].name = meta.name;
            state.metas[meta.nId].image = meta.image;
            state.metas[meta.nId].description = meta.description;
            state.fetchingIPFS = state.fetchReadyIPFS.filter(
              (n: NftTokenMeta) => meta.nId !== n.nId
            );
            state.keys.push(meta.nId);
          })
        ),
    }),
    "meta-store"
  )
);

export const useFetchMeta = (): (items: string[]) => void => {
  const fetchReadyOpenSea = useNftMetaState(
    useCallback((state) => {
      return state.fetchReadyOpenSea;
    }, []),
    shallow
  );
  const fetchReadyIPFS = useNftMetaState(
    useCallback((state) => {
      return state.fetchReadyIPFS;
    }, []),
    shallow
  );
  const nfts = useNftMetaState(
    useCallback((state) => {
      return state.nfts;
    }, []),
    shallow
  );
  const metas = useNftMetaState(
    useCallback((state) => {
      return state.metas;
    }, []),
    shallow
  );
  const setFetchReady = useNftMetaState((state) => state.setFetchReady);
  const setOpenseaResult = useNftMetaState((state) => state.setOpenseaResult);
  const setIPFSResult = useNftMetaState((state) => state.setIPFSResult);

  useEffect(() => {
    const fetchReady = fetchReadyOpenSea;
    if (fetchReady.length < 1) return;
    const contractAddresses: string[] = [];
    const tokenIds: string[] = [];
    fetchReady.forEach((nId) => {
      const [contractAddress, tokenId] = nId.split(RENFT_SUBGRAPH_ID_SEPARATOR)
      contractAddresses.push(contractAddress);
      tokenIds.push(tokenId);
    });

    const subscription = from(fetchNFTsFromOpenSea(contractAddresses, tokenIds))
      .pipe(
        map((founds: Array<NftTokenMeta>) => {
          const foundIds = founds.reduce((acc, nft) => {
            acc.add(nft.nId);
            return acc;
          }, new Set());
          const notFounds = fetchReady.filter((nId) => {
            return !foundIds.has(nId);
          });
          preloadImages(founds);
          setOpenseaResult(founds, notFounds);
        })
      )
      .subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchReadyOpenSea, setOpenseaResult]);
  const nftsInStore = useNftsStore(
    useCallback((state) => state.nfts, [])
  );
  useEffect(() => {
    const fetchReady = fetchReadyIPFS;
    if (fetchReady.length < 1) return;
    const fetchSet = new Set(fetchReadyIPFS);
    const fetchNfts = nfts.filter((nId) => fetchSet.has(nId));
    const subscription = from(fetchNfts)
      .pipe(
        mergeMap((nId) => {
          return from(fetchNFTFromOtherSource(nftsInStore[nId]));
        }),
        map((data) => {
          preloadImages([data]);
          setIPFSResult(data);
        })
      )
      .subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchReadyIPFS, nfts, setIPFSResult, nftsInStore]);

  return useCallback(
    (items: string[]) => {
      if (items.length < 1) return;
      const fetching: string[] = [];
      items.forEach((nId) => {
        if (!metas[nId]) {
          fetching.push(nId);
        }
      });
      if (fetching.length > 0) setFetchReady(fetching);
    },
    [metas, setFetchReady]
  );
};
