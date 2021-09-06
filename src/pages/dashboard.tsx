import React, { useState, useCallback, useContext, useMemo } from "react";

import { useBatchItems } from "../hooks/useBatchItems";
import CatalogueLoader from "../components/catalogue-loader";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import {
  ExtendedLending,
  LendingTable,
} from "../components/pages/dashboard/lending-table";
import {
  ExtendedRenting,
  RentingTable,
} from "../components/pages/dashboard/renting-table";
import { DashboardBatch } from "../components/pages/dashboard/dashboard-batch";
import { mapAddRelendedField, mapToIds, filterClaimed } from "../utils";
import ToggleLayout from "../components/toggle-layout";
import { useRouter } from "next/router";
import { useUserIsLending } from "../hooks/queries/useUserIsLending";
import { useUserRenting } from "../hooks/queries/useUserRenting";
import { useWallet } from "../hooks/useWallet";

enum DashboardViewType {
  LIST_VIEW,
  MINIATURE_VIEW,
}

export const Dashboard: React.FC = () => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { signer } = useWallet();
  const [isClaimModalOpen, toggleClaimModal] = useState(false);
  const [isLendModalOpen, toggleLendModal] = useState(false);
  const [isReturnModalOpen, toggleReturnModal] = useState(false);
  const {
    query: { claimed },
  } = useRouter();

  const showClaimed = useMemo(() => {
    return claimed === "true";
  }, [claimed]);

  const {
    onCheckboxChange,
    handleResetLending,
    handleResetRenting,
    checkedItems,
    checkedLendingItems,
    checkedRentingItems,
    checkedClaims,
  } = useBatchItems();
  const { renting: rentingItems, isLoading: userRentingLoading } =
    useUserRenting();
  const { userLending: lendingItems, isLoading: userLendingLoading } =
    useUserIsLending();
  const [viewType, _] = useState<DashboardViewType>(
    DashboardViewType.LIST_VIEW
  );

  const isLoading = userLendingLoading || userRentingLoading;

  const relendedLendingItems: ExtendedLending[] = useMemo(() => {
    if (!rentingItems) return [];
    return lendingItems
      .map(mapAddRelendedField(mapToIds(rentingItems)))
      .filter(filterClaimed(showClaimed));
  }, [lendingItems, rentingItems, showClaimed]);

  //@ts-ignore
  const relendedRentingItems: ExtendedRenting[] = useMemo(() => {
    if (!rentingItems) return [];
    return rentingItems
      .map(mapAddRelendedField(mapToIds(lendingItems)))
      .filter(filterClaimed(showClaimed));
  }, [lendingItems, rentingItems, showClaimed]);

  const checkBoxChangeWrapped = useCallback(
    (nft) => {
      return () => {
        onCheckboxChange(nft);
      };
    },
    [onCheckboxChange]
  );

  const tabs = useMemo(() => {
    return [
      {
        name: "CURRENT",
        href: "/dashboard?claimed=false",
        current: !showClaimed,
      },
      {
        name: "SHOW CLAIMED",
        href: "/dashboard?claimed=true",
        current: showClaimed,
      },
    ];
  }, [showClaimed]);

  if (!signer) {
    return (
      <ToggleLayout tabs={[]}>
        <div className="text-center text-lg text-white font-display py-32 leading-tight">
          Please connect your wallet!
        </div>
      </ToggleLayout>
    );
  }

  if (isLoading && lendingItems.length === 0 && rentingItems.length === 0)
    return (
      <ToggleLayout tabs={[]}>
        <CatalogueLoader />
      </ToggleLayout>
    );

  if (!isLoading && lendingItems.length === 0 && rentingItems.length === 0) {
    return (
      <ToggleLayout tabs={[]}>
        <div className="text-center text-base text-white font-display py-32 leading-tight">
          You aren&apos;t lending or renting yet. To start lending, head to the
          lend tab.
        </div>
      </ToggleLayout>
    );
  }

  return (
    <ToggleLayout tabs={tabs}>
      {viewType === DashboardViewType.LIST_VIEW && (
        <div className="flex flex-col space-y-2 text-white text-base">
          <LendingTable
            checkedItems={checkedItems}
            toggleClaimModal={toggleClaimModal}
            toggleLendModal={toggleLendModal}
            checkBoxChangeWrapped={checkBoxChangeWrapped}
            lendingItems={relendedLendingItems}
          />
          <RentingTable
            checkedItems={checkedItems}
            toggleReturnModal={toggleReturnModal}
            checkBoxChangeWrapped={checkBoxChangeWrapped}
            rentingItems={relendedRentingItems}
            currentAddress={currentAddress}
          />
        </div>
      )}
      <DashboardBatch
        isReturnModalOpen={isReturnModalOpen}
        checkedRentingItems={checkedRentingItems}
        toggleReturnModal={toggleReturnModal}
        handleResetRenting={handleResetRenting}
        isLendModalOpen={isLendModalOpen}
        checkedLendingItems={checkedLendingItems}
        toggleLendModal={toggleLendModal}
        handleResetLending={handleResetLending}
        isClaimModalOpen={isClaimModalOpen}
        checkedClaims={checkedClaims}
        toggleClaimModal={toggleClaimModal}
      />
    </ToggleLayout>
  );
};

// this keeps rerendering
export default Dashboard;
