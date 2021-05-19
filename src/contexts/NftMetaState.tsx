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
} from "../services/fetch-nft-meta";
import { nftId } from "../services/firebase";
import { Nft } from "./graph/classes";
import { NftToken } from "./graph/types";

type MetaType = NftToken["meta"] & { id: string };
type MetaMap = Map<string, MetaType>;
type Dunno =  {
  data: MetaType;
  fetchReady: boolean;
  isLoading: boolean;
  loadingFrom: "opensea" | "ipfs";
}
const fetchMetas = (items: Nft[]) => {
  // nothing
};

export const NFTMetaContext = createContext<[Record<string,Dunno>, typeof fetchMetas]>([
  {},
  fetchMetas,
]);

type State = Record<
  string,
  Dunno
>;
type Action =
  | {
      type: "SET_FETCH_READY";
      payload: Nft & { id: string }[];
    }
  | {
      type: "SET_FETCHING_OPENSEA" | "SET_FETCHING_IPFS";
      payload: MetaType[];
    }
  | {
      type: "SET_OPENSEA_RESULT";
      payload: {
        founds: MetaType[];
        notFounds: MetaType[];
      };
    }
  | {
      type: "SET_IPFS_RESULT";
      payload: MetaType;
    };
const reducer = (state: State, action: Action) => {
  console.log(state, action)
  switch (action.type) {
    case "SET_FETCH_READY": {
      const metas = { ...state };
      const hasDifference = false;
      action.payload.forEach((nft) => {
        if (!metas[nft.id]) {
          metas[nft.id] = {
            data: nft,
            fetchReady: true,
            isLoading: false,
            loadingFrom: "opensea",
          };
        }
      });
      if (!hasDifference) {
        return state;
      }
      return metas;
    }
    case "SET_FETCHING_OPENSEA": {
      const metas = { ...state };
      const hasDifference = false;
      action.payload.forEach((nft) => {
        metas[nft.id] = {
          ...metas[nft.id],
          fetchReady: false,
          isLoading: true,
          loadingFrom: "opensea",
        };
      });
      if (!hasDifference) {
        return state;
      }
      return metas;
    }
    case "SET_FETCHING_IPFS": {
      const metas = { ...state };
      const hasDifference = false;
      action.payload.forEach((nft) => {
        metas[nft.id] = {
          ...metas[nft.id],
          fetchReady: false,
          isLoading: true,
          loadingFrom: "ipfs",
        };
      });
      if (!hasDifference) {
        return state;
      }
      return metas;
    }
    case "SET_OPENSEA_RESULT": {
      const { founds, notFounds } = action.payload;
      const metas = { ...state };
      founds.map((nft) => {
        metas[nft.id] = {
          data: {
            ...metas[nft.id].data,
            ...nft,
          },
          fetchReady: false,
          isLoading: false,
          loadingFrom: "opensea",
        };
      });
      notFounds.map((nft) => {
        metas[nft.id] = {
          ...metas[nft.id],
          fetchReady: true,
          isLoading: false,
          loadingFrom: "ipfs",
        };
      });
      return metas;
    }
    case "SET_IPFS_RESULT": {
      const meta = action.payload;
      const metas = { ...state };
      metas[meta.id] = {
        data: {
          ...metas[meta.id].data,
          ...meta,
        },
        fetchReady: false,
        isLoading: false,
        loadingFrom: "opensea",
      };

      return metas;
    }
  }
};
export const NFTMetaProvider: React.FC = ({ children }) => {
  const [metas, dispatch] = useReducer(reducer, {});
  const fetchNFTs = useCallback((items: Nft[]) => {
    const fetching = items.map((nft) => {
      const key = nftId(nft.address, nft.tokenId);

      return { ...nft, id: key };
    });
    // @ts-ignore
    dispatch({ type: "SET_FETCH_READY", payload: fetching });
  }, []);

  useEffect(() => {
    //TODO:eniko Make this into the state
    const fetchReady = Object.values(metas)
      .filter((meta) => meta.fetchReady && meta.loadingFrom === "opensea")
      .map((v) => v.data);
    console.log('fetchread', fetchReady)  
    if (fetchReady.length < 1) return;
    const contractAddress: string[] = [];
    const tokenIds: string[] = [];
    fetchReady.forEach((nft) => {
      const [address, tokenId] = nft.id.split(RENFT_SUBGRAPH_ID_SEPARATOR);
      contractAddress.push(address);
      tokenIds.push(tokenId);
    });
    fetchNFTsFromOpenSea(contractAddress, tokenIds).then((data) => {
      const found = data.reduce((acc, nft) => {
        acc.add(nft.id);
        return acc;
      }, new Set());
      const notFounds = fetchReady.filter((nft) => {
        return !found.has(nft.id);
      });
      dispatch({
        type: "SET_OPENSEA_RESULT",
        payload: {
          notFounds,
          // @ts-ignore
          founds: data,
        },
      });
    });
    // TODO:eniko fix ts-ignore
    // @ts-ignore
    dispatch({ type: "SET_FETCH_READY", payload: fetchReady });
  }, [metas]);

  useEffect(() => {
    const fetchReady = Object.values(metas)
      .filter((meta) => meta.fetchReady && meta.loadingFrom === "ipfs")
      .map((v) => v.data);
    if (fetchReady.length < 1) return;
    dispatch({ type: "SET_FETCHING_IPFS", payload: fetchReady });
    // @ts-ignore
    const promises = fetchReady.map(fetchNFTFromOtherSource);
    promises.map((promise) => {
      promise.then((data) => {
        dispatch({ type: "SET_IPFS_RESULT", payload: data });
      });
    });
  }, [metas]);

  return (
    // @ts-ignore
    <NFTMetaContext.Provider value={[metas, fetchNFTs]}>
      {children}
    </NFTMetaContext.Provider>
  );
};
