import { useCallback, useEffect } from "react";
import {
  fetchNFTFromOtherSource,
  fetchNFTsFromOpenSea,
  NftMetaWithId
} from "../services/fetch-nft-meta";
import { Nft } from "../contexts/graph/classes";
import { NftTokenMetaWithId } from "../contexts/graph/types";
import create from "zustand";
import shallow from "zustand/shallow";
import { devtools } from "zustand/middleware";
import produce from "immer";
import { from, map, mergeMap } from "rxjs";

interface MetaLoading extends NftTokenMetaWithId {
  loading?: boolean;
}

type NftMetaState = {
  metas: Record<string, MetaLoading>;
  nfts: Nft[];
  keys: string[];
  fetchReadyOpenSea: Nft[];
  fetchReadyIPFS: Nft[];
  setFetchReady: (items: Nft[]) => void;
  setIPFSResult: (items: NftMetaWithId) => void;
  setOpenseaResult: (
    items: NftMetaWithId[],
    notFounds: NftMetaWithId[]
  ) => void;
};

const preloadImages = (metas: MetaLoading[]) => {
  metas.map((meta) => {
    const img = new Image();
    if (meta.image) img.src = meta.image;
  });
};

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
              const id = nft.id;
              if (!state.metas[id]) {
                state.metas[id] = {
                  id: nft.id,
                  loading: true
                };
                state.nfts.push(nft);
                state.fetchReadyOpenSea.push(nft);
              }
            });
          })
        ),
      setOpenseaResult: (founds: NftMetaWithId[], notFounds: NftMetaWithId[]) =>
        set(
          produce((state) => {
            if (founds.length < 1 && notFounds.length < 1) return;
            const foundSet = new Set(founds.map((f) => f.id));
            founds.map((meta) => {
              if (!state.metas[meta.id]) state.metas[meta.id] = {};
              state.metas[meta.id].loading = false;
              state.metas[meta.id].name = meta.name;
              state.metas[meta.id].image = meta.image;
              state.metas[meta.id].description = meta.description;
              state.metas[meta.id].collection = meta.collection;
              state.metas[meta.id].openseaLink = meta.openseaLink;
            });
            state.fetchReadyOpenSea = state.fetchReadyOpenSea.filter(
              (n: NftTokenMetaWithId) => !foundSet.has(n.id)
            );
            state.fetchReadyIPFS = notFounds;
            state.keys.push(...founds.map((f) => f.id));
          })
        ),
      setIPFSResult: (meta: NftMetaWithId) =>
        set(
          produce((state) => {
            state.metas[meta.id].loading = false;
            state.metas[meta.id].name = meta.name;
            state.metas[meta.id].image = meta.image;
            state.metas[meta.id].description = meta.description;
            state.fetchingIPFS = state.fetchReadyIPFS.filter(
              (n: NftMetaWithId) => meta.id !== n.id
            );
            state.keys.push(...meta.id);
          })
        )
    }),
    "meta-store"
  )
);

export const useFetchMeta = () => {
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
    const contractAddress: string[] = [];
    const tokenIds: string[] = [];
    fetchReady.forEach((nft: Nft) => {
      contractAddress.push(nft.address);
      tokenIds.push(nft.tokenId);
    });

    const subscription = from(fetchNFTsFromOpenSea(contractAddress, tokenIds))
      .pipe(
        map((founds: Array<NftMetaWithId>) => {
          const foundIds = founds.reduce((acc, nft) => {
            acc.add(nft.id);
            return acc;
          }, new Set());
          const notFounds = fetchReady.filter((nft: NftTokenMetaWithId) => {
            return !foundIds.has(nft.id);
          });
          preloadImages(founds);
          setOpenseaResult(founds, notFounds);
        })
      )
      .subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchReadyOpenSea]);

  useEffect(() => {
    const fetchReady = fetchReadyIPFS;
    if (fetchReady.length < 1) return;
    const fetchSet = new Set(fetchReadyIPFS.map((v: MetaLoading) => v.id));
    const fetchNfts = nfts.filter((nft) => fetchSet.has(nft.id));
    const subscription = from(fetchNfts)
      .pipe(
        mergeMap((nft) => {
          return from(fetchNFTFromOtherSource(nft));
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
  }, [fetchReadyIPFS, nfts]);

  return useCallback(
    (items: Nft[]) => {
      if (items.length < 1) return;
      const fetching: Nft[] = [];
      items.forEach((nft) => {
        if (!metas[nft.id]) {
          fetching.push({
            ...nft
          });
        }
      });
      if (fetching.length > 0) setFetchReady(fetching);
    },
    [metas]
  );
};
