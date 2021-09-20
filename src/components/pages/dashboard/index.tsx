import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { useWallet } from "../../../hooks/store/useWallet";
import SearchLayout from "../../layouts/search-layout";

export const DashboardPage: React.FC = ({ children }) => {
  const { signer } = useWallet();
  const router = useRouter();

  const tabs = useMemo(()=>{
    return [
      {
        name: "Lending",
        current: router.route === '/dashboard/[lending]' || router.route === '/dashboard',
        href: "/dashboard/lending"
      },
      {
        name: "Renting",
        current: router.route === '/dashboard/[renting]',
        href: "/dashboard/renting"
      },
      {
        name: "Favorites",
        current: router.route == '/dashboard/[favorites]',
        href: "/dashboard/favorites"
      }
    ]
  }, [router.route])
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
