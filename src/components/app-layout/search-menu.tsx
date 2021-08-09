import React from "react";
import { NftFilterSelect } from "./nft-filter-select";
import { NftSortBySelect } from "./nft-sortby-select";

export const SearchMenu: React.FC = () => {
  return (
    <div className="menu menu__search">
      <div className="menu__item">
        <NftFilterSelect />
      </div>
      <div className="menu__item">
        <NftSortBySelect />
      </div>
    </div>
  );
};
