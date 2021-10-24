import React from "react";
import { NftFilterSelect } from "./nft-filter-select";
import { NftSortBySelect } from "./nft-sortby-select";

export const SearchMenu: React.FC = () => {
  return (
    <div className="flex flex-col content-center justify-center md:flex-row md:justify-end flex-1">
      <div className="flex-initial md:mr-4">
        <NftFilterSelect />
      </div>
      <div className="flex-initial">
        <NftSortBySelect />
      </div>
    </div>
  );
};
