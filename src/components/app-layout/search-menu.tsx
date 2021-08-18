import React from "react";
import { NftFilterSelect } from "./nft-filter-select";
import { NftSortBySelect } from "./nft-sortby-select";

export const SearchMenu: React.FC = () => {
  return (
    <div className="flex justify-end flex-1">
      <div className="mr-4">
        <NftFilterSelect />
      </div>
      <div className="">
        <NftSortBySelect />
      </div>
    </div>
  );
};
