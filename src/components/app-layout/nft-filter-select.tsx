import { FormControl } from "@material-ui/core";
import React, { useCallback } from "react";

import create from "zustand";
import shallow from "zustand/shallow";
import produce from "immer";
import { devtools } from "zustand/middleware";
import { CategorySelect, CategoryMenuItem } from "../common/category-select";

export type NftFilterType = 'all' | 'art' | 'utility' | 'gaming' | 'erc-721' | 'erc-1155' | 'punks' | 'mooncats';
interface NftFilterState {
  filters: NftFilterType;
  setFilters: ( event: React.ChangeEvent<{ name?: string; value: unknown }>) => void;
}

export const useNFTFilterBy = create<NftFilterState>(
  devtools((set, get) => ({
    filters: "all",
    setFilters: ( event: React.ChangeEvent<{ name?: string; value: unknown }>) =>
      set(
        produce((state) => {
          state.filters = event.target.value;
        })
      )
  }))
);

export const NftFilterSelect = () => {
  const setNftFilter = useNFTFilterBy((state) => state.setFilters, shallow);
  const filter = useNFTFilterBy(
    useCallback((state) => {
      return state.filters;
    }, []),
    shallow
  );

  return (
    <FormControl>
      <CategorySelect
        labelId="nft-filter-by-select-label"
        id="nft-filter-by"
        value={filter}
        onChange={setNftFilter}
      >
        <CategoryMenuItem value="all">All Nfts</CategoryMenuItem>
        <CategoryMenuItem value="art">Art</CategoryMenuItem>
        <CategoryMenuItem value="utility">Utility</CategoryMenuItem>
        <CategoryMenuItem value="gaming">Gaming</CategoryMenuItem>
        <CategoryMenuItem value="erc-721">ERC-721</CategoryMenuItem>
        <CategoryMenuItem value="erc-1155">ERC-1155</CategoryMenuItem>
        <CategoryMenuItem value="punks">Punks</CategoryMenuItem>
        <CategoryMenuItem value="mooncats">Mooncats</CategoryMenuItem>
      </CategorySelect>
    </FormControl>
  );
};
