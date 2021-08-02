import React from "react";
import { NftFilterSelect } from "./nft-filter-select";
import { NftSortBySelect } from "./nft-sortby-select";

export const SearchMenu = () => {
  return (
    <>
      <NftFilterSelect />
      <NftSortBySelect />
    </>
  );
};
