import React, { useState, useCallback } from "react";

import { useBatchItems } from "../hooks/useBatchItems";
import { LendingTable } from "../components/pages/dashboard/lending-table";
import { RentingTable } from "../components/pages/dashboard/renting-table";
import { DashboardBatch } from "../components/pages/dashboard/dashboard-batch";
import SearchLayout from "../components/search-layout";
import { useWallet } from "../hooks/useWallet";

export const Dashboard: React.FC = () => {
  const { signer } = useWallet();
  const [isClaimModalOpen, toggleClaimModal] = useState(false);
  const [isLendModalOpen, toggleLendModal] = useState(false);
  const [isReturnModalOpen, toggleReturnModal] = useState(false);

  const { onCheckboxChange, handleReset, checkedItems } = useBatchItems();

  const checkBoxChangeWrapped = useCallback(
    (nft) => {
      return () => {
        onCheckboxChange(nft);
      };
    },
    [onCheckboxChange]
  );

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
    <SearchLayout tabs={[]}>
      <div className="flex flex-col space-y-2 text-white text-base">
        <LendingTable
          checkedItems={checkedItems}
          toggleClaimModal={toggleClaimModal}
          toggleLendModal={toggleLendModal}
          checkBoxChangeWrapped={checkBoxChangeWrapped}
        />
        <RentingTable
          checkedItems={checkedItems}
          checkBoxChangeWrapped={checkBoxChangeWrapped}
        />
      </div>
      <DashboardBatch
        isReturnModalOpen={isReturnModalOpen}
        checkedRentingItems={checkedItems}
        toggleReturnModal={toggleReturnModal}
        isLendModalOpen={isLendModalOpen}
        checkedLendingItems={checkedItems}
        toggleLendModal={toggleLendModal}
        handleReset={handleReset}
        isClaimModalOpen={isClaimModalOpen}
        checkedClaims={checkedItems}
        toggleClaimModal={toggleClaimModal}
      />
    </SearchLayout>
  );
};

export default Dashboard;
