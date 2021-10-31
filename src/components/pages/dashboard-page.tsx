import React, { useMemo } from "react";
import { useRouter } from "next/router";
import { useWallet } from "renft-front/hooks/store/useWallet";
import SearchLayout from "renft-front/components/layouts/search-layout";
import { NoSignerMessage } from "renft-front/components/no-signer-message";

export const DashboardPage: React.FC = ({ children }) => {
  const { signer } = useWallet();
  const { pathname } = useRouter();

  const tabs = useMemo(() => {
    return [
      {
        name: "Lending",
        current: pathname === "/dashboard/lending" || pathname === "/dashboard",
        href: "/dashboard/lending",
      },
      {
        name: "Renting",
        current: pathname === "/dashboard/renting",
        href: "/dashboard/renting",
      },
    ];
  }, [pathname]);
  if (!signer) {
    return (
      <SearchLayout tabs={[]} addPading>
        <NoSignerMessage />
      </SearchLayout>
    );
  }

  return (
    <SearchLayout tabs={tabs} addPadding>
      <div className="flex flex-col space-y-2 text-white text-base">
        {children}
      </div>
    </SearchLayout>
  );
};
