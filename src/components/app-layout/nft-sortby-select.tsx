import React, { useMemo } from "react";

import create from "zustand";
import shallow from "zustand/shallow";
import produce from "immer";
import { devtools } from "zustand/middleware";
import { CategorySelect } from "../common/category-select";
import { useSortOptions } from "../../hooks/useSearch";

interface NftSortbyState {
  sortBy: string;
  setSortby: (value: string) => void;
}

export const useNFTSortBy = create<NftSortbyState>(
  devtools((set) => ({
    sortBy: "Sort by",
    setSortby: (value) =>
      set(
        produce((state) => {
          state.sortBy = value;
        })
      )
  }))
);
export const NftSortBySelect: React.FC = () => {
  const setSortBy = useNFTSortBy((state) => state.setSortby, shallow);
  const sortBy = useNFTSortBy((state) => state.sortBy, shallow);
  const options = useSortOptions();
  const value = useMemo(()=>{
    return options.find(f => f.name === sortBy);
  }, [options, sortBy])
  return (
    <CategorySelect
      value={value}
      setValue={setSortBy}
      options={options}
      defaultValue={{ name: "Sort by", description: "", imageUrl: "" }}
    ></CategorySelect>
  );
};
