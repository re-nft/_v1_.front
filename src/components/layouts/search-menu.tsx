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
    <div className="flex flex-col content-center space-y-3 md:space-y-0  ml-8 md:ml-0 md:flex-row md:justify-end flex-1">
      <div className="flex-initial md:mr-4 self-center md:self-auto">
        <NftFilterSelect />
      </div>
      <div className="flex-initial self-center md:self-auto">
        {!isLendPage && <NftSortBySelect />}
      </div>
    </div>
  );
};
