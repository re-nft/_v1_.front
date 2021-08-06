import { FormControl } from "@material-ui/core";
import React, { useCallback } from "react";

import create from "zustand";
import shallow from "zustand/shallow";
import produce from "immer";
import { devtools } from "zustand/middleware";
import { CategorySelect, CategoryMenuItem } from "../common/category-select";

export type NftSortType =
  | "all"
 // | "recently-listed"
//  | "recently-rented"
  | "price-low-to-high"
  | "price-high-to-low"
  | "highest-collateral"
  | "lowest-collateral";

interface NftSortbyState {
  sortBy: NftSortType;
  setSortby: (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => void;
}

export const useNFTSortBy = create<NftSortbyState>(
  devtools((set) => ({
    sortBy: "all",
    setSortby: (event: React.ChangeEvent<{ name?: string; value: unknown }>) =>
      set(
        produce((state) => {
          state.sortBy = event.target.value;
        })
      )
  }))
);
export const NftSortBySelect: React.FC = () => {
  const setSortBy = useNFTSortBy((state) => state.setSortby, shallow);
  const sortBy = useNFTSortBy(
    useCallback((state) => {
      return state.sortBy;
    }, []),
    shallow
  );

  return (
    <FormControl>
      <CategorySelect
        labelId="nft-sortby-by-select-label"
        id="nft-sortby-by"
        value={sortBy}
        onChange={setSortBy}
      >
        <CategoryMenuItem value="all">Sort by</CategoryMenuItem>
        <CategoryMenuItem value="recently-listed">
          Recently Listed
        </CategoryMenuItem>
        {/* <CategoryMenuItem value="recently-rented">
          Recently Rented
        </CategoryMenuItem> */}
        <CategoryMenuItem value="price-low-to-high">
          Price: Low to High
        </CategoryMenuItem>
        <CategoryMenuItem value="price-high-to-low">
          Price: High to Low
        </CategoryMenuItem>
        <CategoryMenuItem value="highest-collateral">
          Highest Collateral
        </CategoryMenuItem>
        <CategoryMenuItem value="lowest-collateral">
          Lowest Colletaral
        </CategoryMenuItem>
      </CategorySelect>
    </FormControl>
  );
};
