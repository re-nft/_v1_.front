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

const fetchMetas = (items: Nft[]) => {
  // nothing
};

interface MetaLoading extends NftTokenMetaWithId {
  loading?: boolean;
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
      action.payload.forEach((nft) => {
        const id = nftId(nft.address, nft.tokenId);
        if (!state.metas[id]) {
          hasChange = true;
          state.metas[id] = {
            id: id,
            // @ts-ignore
            loading: true,
          };
          fetchReady.push({ id: id, loading: true });
        }
      });
      if (!hasChange) return state;
      state.nfts = [...state.nfts, ...action.payload];
      state.fetchReadyOpenSea = [...fetchReady, ...state.fetchReadyOpenSea];
      return { ...state };
    }
    case "SET_FETCHING_OPENSEA": {
      if (action.payload.length < 1) return state;
      state.fetchingOpenSea = [...state.fetchingOpenSea, ...action.payload];
      state.fetchReadyOpenSea = [];
      return { ...state };
    }
    case "SET_FETCHING_IPFS": {
      if (action.payload.length < 1) return state;
      state.fetchingIPFS = [...state.fetchingIPFS, ...action.payload];
      state.fetchReadyIPFS = [];
      return { ...state };
    }
    case "SET_OPENSEA_RESULT": {
      const { founds, notFounds } = action.payload;
      if (founds.length < 1 && notFounds.length < 1) return state;
      const foundSet = new Set(founds.map((f) => f.id));
      founds.map((meta) => {
        state.metas[meta.id] = {
          ...meta,
          loading: false,
        };
      });
      state.fetchingOpenSea = state.fetchReadyOpenSea.filter(
        (n) => !foundSet.has(n.id)
      );
      state.fetchReadyIPFS = [...state.fetchReadyIPFS, ...notFounds];
      return { ...state };
    }
    case "SET_IPFS_RESULT": {
      state.metas[action.payload.id] = {
        ...action.payload,
        loading: false,
      };
      state.fetchingIPFS = state.fetchReadyOpenSea.filter(
        (n) => action.payload.id !== n.id
      );
      return { ...state };
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
  metas.map((meta) => {
    const img = new Image();
    if (meta.image) img.src = meta.image;
  });
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

    fetchRequest.then((data) => {
      const found = data.reduce((acc, nft) => {
        acc.add(nft.id);
        return acc;
      }, new Set());
      const notFounds = fetchReady.filter((nft: NftTokenMetaWithId) => {
        return !found.has(nft.id);
      });
      preloadImages(data);
      dispatch({
        type: "SET_OPENSEA_RESULT",
        payload: {
          notFounds,
          founds: data,
        },
      });
    });
    dispatch({ type: "SET_FETCHING_OPENSEA", payload: fetchReady });
  }, [fetchReadyOpenSea]);

  useEffect(() => {
    const fetchReady = fetchReadyIPFS;
    if (fetchReady.length < 1) return;
    const fetchSet = new Set(fetchReadyIPFS.map((v) => v.id));
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
