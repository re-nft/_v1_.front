import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { useWallet } from "../../hooks/store/useWallet";
import SearchLayout from "../layouts/search-layout";

export const DashboardPage: React.FC = ({ children }) => {
  const { signer } = useWallet();
  const {pathname} = useRouter();

  const tabs = useMemo(()=>{
    return [
      {
        name: "Lending",
        current: pathname === '/dashboard/lending' || pathname === '/dashboard',
        href: "/dashboard/lending"
      },
      {
        name: "Renting",
        current: pathname === '/dashboard/renting',
        href: "/dashboard/renting"
      },
      {
        name: "Favourites",
        current: pathname == '/dashboard/favourites',
        href: "/dashboard/favourites"
      }
    ]
  }, [pathname])
  if (!signer) {
    return (
      <SearchLayout tabs={[]}>
        <div className="text-center text-lg text-white font-display py-32 leading-tight">
          Please connect your wallet!
        </div>
      </SearchLayout>
    );
  }

  return (
    <SearchLayout
      tabs={tabs}
    >
      <div className="flex flex-col space-y-2 text-white text-base">
        {children}
      </div>
    </SearchLayout>
  );
};
