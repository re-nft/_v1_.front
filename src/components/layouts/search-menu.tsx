import React, { useMemo } from "react";
import { NftFilterSelect } from "./nft-filter-select";
import { NftSortBySelect } from "./nft-sortby-select";
import { useRouter } from "next/router";

export const SearchMenu: React.FC = () => {
  const { pathname } = useRouter();

  const isLendPage = useMemo(() => {
    return pathname.startsWith("/lend");
  }, [pathname]);
  return (
    <div className="flex flex-col content-center justify-center md:flex-row md:justify-end flex-1">
      <div className="flex-initial md:mr-4">
        <NftFilterSelect />
      </div>
      <div className="flex-initial">{!isLendPage && <NftSortBySelect />}</div>
    </div>
  );
};
