import React, { createContext, useState, useCallback } from "react";
import { NftToken } from "./graph/types";

type MetaType = NftToken["meta"] & { id: string };
type MetaArray = Array<MetaType>;
type MetaMap = Map<string, MetaType>;
const setMetas = (items: MetaArray) => {
  // nothing
};
export const NFTMetaContext = createContext<[MetaMap, typeof setMetas]>([
  new Map(),
  setMetas,
]);

export const NFTMetaProvider: React.FC = ({ children }) => {
  const [metas, setMetas] = useState<MetaMap>(new Map());

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
  return (
    <NFTMetaContext.Provider value={[metas, addMetas]}>
      {children}
    </NFTMetaContext.Provider>
  );
};
