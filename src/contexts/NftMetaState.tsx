import React, {
  createContext,
  useCallback,
  useEffect,
  useReducer,
} from "react";
import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../consts";
import {
  fetchNFTFromOtherSource,
  fetchNFTsFromOpenSea,
  NftMetaWithId,
} from "../services/fetch-nft-meta";
import { nftId } from "../services/firebase";
import { Nft } from "./graph/classes";
import { NftTokenMetaWithId } from "./graph/types";

const fetchMetas = (_items: Nft[]) => {
  // nothing
};

interface MetaLoading extends NftTokenMetaWithId {
  loading?: boolean;
  openseaLink?: string
  raribleLink?: string
  isVerified?: boolean
}

export const NFTMetaContext = createContext<
  [Record<string, MetaLoading>, typeof fetchMetas]
>([{}, fetchMetas]);

NFTMetaContext.displayName = "NFTMetaContext";

type State = {
  metas: Record<string, MetaLoading>;
  nfts: Nft[];
  fetchReadyOpenSea: MetaLoading[];
  fetchingOpenSea: MetaLoading[];
  fetchingIPFS: MetaLoading[];
  fetchReadyIPFS: MetaLoading[];
};

type Action =
  | {
      type: "SET_FETCH_READY";
      payload: Nft[];
    }
  | {
      type: "SET_FETCHING_OPENSEA" | "SET_FETCHING_IPFS";
      payload: NftMetaWithId[];
    }
  | {
      type: "SET_OPENSEA_RESULT";
      payload: {
        founds: NftMetaWithId[];
        notFounds: NftMetaWithId[];
      };
    }
  | {
      type: "SET_IPFS_RESULT";
      payload: NftMetaWithId;
    };

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_FETCH_READY": {
      const fetchReady: MetaLoading[] = [];
      let hasChange = false;
      const metas: Record<string, MetaLoading> = { ...state.metas };
      action.payload.forEach((nft) => {
        const id = nftId(nft.address, nft.tokenId);
        if (!state.metas[id]) {
          hasChange = true;
          metas[id] = {
            id: id,
            // @ts-ignore
            loading: true,
          };
          fetchReady.push({ id: id, loading: true });
        }
      });
      if (!hasChange) return state;
      const nfts = [...state.nfts, ...action.payload];
      const fetchReadyOpenSea = [...fetchReady, ...state.fetchReadyOpenSea];
      return { ...state, nfts, fetchReadyOpenSea, metas };
    }
    case "SET_FETCHING_OPENSEA": {
      if (action.payload.length < 1) return state;
      const fetchingOpenSea = [...state.fetchingOpenSea, ...action.payload];
      const fetchReadyOpenSea: MetaLoading[] = [];
      return { ...state, fetchingOpenSea, fetchReadyOpenSea };
    }
    case "SET_FETCHING_IPFS": {
      if (action.payload.length < 1) return state;
      const fetchingIPFS = [...state.fetchingIPFS, ...action.payload];
      const fetchReadyIPFS: MetaLoading[] = [];
      return { ...state, fetchingIPFS, fetchReadyIPFS };
    }
    case "SET_OPENSEA_RESULT": {
      const { founds, notFounds } = action.payload;
      if (founds.length < 1 && notFounds.length < 1) return state;
      const foundSet = new Set(founds.map((f) => f.id));
      const metas: Record<string, MetaLoading> = { ...state.metas };
      founds.map((meta) => {
        metas[meta.id] = {
          ...meta,
          loading: false,
        };
      });
      const fetchingOpenSea = state.fetchReadyOpenSea.filter(
        (n) => !foundSet.has(n.id)
      );
      const fetchReadyIPFS = [...state.fetchReadyIPFS, ...notFounds];
      return { ...state, fetchingOpenSea, fetchReadyIPFS, metas };
    }
    case "SET_IPFS_RESULT": {
      const metas = { ...state.metas };
      metas[action.payload.id] = {
        ...action.payload,
        loading: false,
      };
      const fetchingIPFS = state.fetchReadyOpenSea.filter(
        (n) => action.payload.id !== n.id
      );
      return { ...state, metas, fetchingIPFS };
    }
  }
};

const initialState = {
  metas: {},
  fetchReadyOpenSea: [],
  fetchingOpenSea: [],
  fetchingIPFS: [],
  fetchReadyIPFS: [],
  nfts: [],
};

const preloadImages = (metas: MetaLoading[]) => {
  // metas.map((meta) => {
  //   const img = new Image();
  //   if (meta.image) img.src = meta.image;
  // });
};

export const NFTMetaProvider: React.FC = ({ children }) => {
  const [{ fetchReadyOpenSea, fetchReadyIPFS, nfts, metas }, dispatch] =
    useReducer(reducer, initialState);

  const fetchNFTs = useCallback((items: Nft[]) => {
    if (items.length < 1) return;
    const fetching = items.map((nft) => {
      const key = nftId(nft.address, nft.tokenId);

      return { ...nft, id: key };
    });
    dispatch({ type: "SET_FETCH_READY", payload: fetching });
  }, []);

  useEffect(() => {
    const fetchReady = fetchReadyOpenSea;
    if (fetchReady.length < 1) return;
    const contractAddress: string[] = [];
    const tokenIds: string[] = [];
    fetchReady.forEach((meta: NftTokenMetaWithId) => {
      const [address, tokenId] = meta.id.split(RENFT_SUBGRAPH_ID_SEPARATOR);
      contractAddress.push(address);
      tokenIds.push(tokenId);
    });
    const fetchRequest = fetchNFTsFromOpenSea(contractAddress, tokenIds);

    fetchRequest.then((founds) => {
      const foundIds = founds.reduce((acc, nft) => {
        acc.add(nft.id);
        return acc;
      }, new Set());
      const notFounds = fetchReady.filter((nft: NftTokenMetaWithId) => {
        return !foundIds.has(nft.id);
      });
      preloadImages(founds);
      dispatch({
        type: "SET_OPENSEA_RESULT",
        payload: {
          notFounds,
          founds,
        },
      });
    });
    dispatch({ type: "SET_FETCHING_OPENSEA", payload: fetchReady });
  }, [fetchReadyOpenSea]);

  useEffect(() => {
    const fetchReady = fetchReadyIPFS;
    if (fetchReady.length < 1) return;
    const fetchSet = new Set(fetchReadyIPFS.map((v: MetaLoading) => v.id));
    const fetchNfts = nfts.filter((nft) =>
      fetchSet.has(nftId(nft.address, nft.tokenId))
    );

    fetchNfts.map((nft) => {
      const fetchRequest = fetchNFTFromOtherSource(nft);
      fetchRequest.then((data) => {
        preloadImages([data]);
        dispatch({ type: "SET_IPFS_RESULT", payload: data });
      });
      return fetchRequest;
    });
    dispatch({ type: "SET_FETCHING_IPFS", payload: fetchReady });
  }, [fetchReadyIPFS, nfts]);

  return (
    <NFTMetaContext.Provider value={[metas, fetchNFTs]}>
      {children}
    </NFTMetaContext.Provider>
  );
};
