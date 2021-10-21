import { useCallback, useEffect } from "react";
import {
  fetchNFTFromOtherSource,
  fetchNFTsFromOpenSea,
} from "../services/fetch-nft-meta";
import { Nft } from "../contexts/graph/classes";
import { NftTokenMeta } from "../contexts/graph/types";
import create from "zustand";
import shallow from "zustand/shallow";
import { devtools } from "zustand/middleware";
import produce from "immer";
import { from, map, mergeMap } from "rxjs";

interface MetaLoading extends NftTokenMeta {
  loading?: boolean;
}

type NftMetaState = {
  metas: Record<string, MetaLoading>;
  nfts: Nft[];
  keys: string[];
  fetchReadyOpenSea: Nft[];
  fetchReadyIPFS: Nft[];
  setFetchReady: (items: Nft[]) => void;
  setIPFSResult: (items: NftTokenMeta) => void;
  setOpenseaResult: (items: NftTokenMeta[], notFounds: NftTokenMeta[]) => void;
};

// const preloadImages = (metas: MetaLoading[]) => {
//   metas.map((meta) => {
//     const img = new Image();
//     if (meta.image) img.src = meta.image;
//   });
// };

export const useNftMetaState = create<NftMetaState>(
  devtools(
    (set, get) => ({
      metas: {},
      keys: [],
      fetchReadyOpenSea: [],
      fetchReadyIPFS: [],
      nfts: [],
      setFetchReady: (fetching: Nft[]) =>
        set(
          produce((state) => {
            fetching.forEach((nft) => {
              if (!state.metas[nft.id]) {
                state.metas[nft.nId] = {
                  nId: nft.nId,
                  loading: true,
                };
                state.nfts.push(nft);
                state.fetchReadyOpenSea.push(nft);
              }
            });
          })
        ),
      setOpenseaResult: (founds: NftTokenMeta[], notFounds: NftTokenMeta[]) =>
        set(
          produce((state) => {
            if (founds.length < 1 && notFounds.length < 1) return;
            founds.map((meta) => {
              if (!state.metas[meta.nId]) state.metas[meta.nId] = {};
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
            state.fetchReadyIPFS = [...state.fetchReadyIPFS, ...notFounds];
            state.keys.push(...founds.map((f) => f.nId));
          })
        ),
      setIPFSResult: (meta: NftTokenMeta) =>
        set(
          produce((state) => {
            if (!state.metas[meta.nId]) state.metas[meta.nId] = {};
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

export const useFetchMeta = (): ((items: Nft[]) => void) => {
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
  const setFetchReady = useNftMetaState(
    useCallback((state) => state.setFetchReady, [])
  );
  const setOpenseaResult = useNftMetaState(
    useCallback((state) => state.setOpenseaResult, [])
  );
  const setIPFSResult = useNftMetaState(
    useCallback((state) => state.setIPFSResult, [])
  );

  useEffect(() => {
    const fetchReady = fetchReadyOpenSea;
    if (fetchReady.length < 1) return;
    const fetch: Nft[] =
      fetchReady.length > 20 ? fetchReady.slice(0, 20) : fetchReady;

    const contractAddress: string[] = [];
    const tokenIds: string[] = [];
    fetch.forEach((nft: Nft) => {
      contractAddress.push(nft.address);
      tokenIds.push(nft.tokenId);
    });

    const subscription = from(fetchNFTsFromOpenSea(contractAddress, tokenIds))
      .pipe(
        map((founds: Array<NftTokenMeta>) => {
          const foundIds = founds.reduce((acc, nft) => {
            acc.add(nft.nId.toLowerCase());
            return acc;
          }, new Set());
          const notFounds = fetch.filter((nft: NftTokenMeta) => {
            return !foundIds.has(nft.nId.toLowerCase());
          });

          //  preloadImages(founds);
          setOpenseaResult(founds, notFounds);
        })
      )
      .subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchReadyOpenSea, setOpenseaResult]);

  useEffect(() => {
    const fetchReady = fetchReadyIPFS;
    if (fetchReady.length < 1) return;
    const fetchSet = new Set(fetchReadyIPFS.map((v: MetaLoading) => v.nId));
    const fetchNfts = nfts.filter((nft) => fetchSet.has(nft.nId));
    const subscription = from(fetchNfts)
      .pipe(
        mergeMap((nft) => {
          return from(fetchNFTFromOtherSource(nft));
        }),
        map((data) => {
          //   preloadImages([data]);
          setIPFSResult(data);
        })
      )
      .subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchReadyIPFS, nfts, setIPFSResult]);

  return useCallback(
    (items: Nft[]) => {
      if (items.length < 1) return;
      const fetching: Nft[] = [];
      items.forEach((nft) => {
        if (!metas[nft.nId]) {
          fetching.push({
            ...nft,
          });
        }
      });
      if (fetching.length > 0) setFetchReady(fetching);
    },
    [metas, setFetchReady]
  );
};
