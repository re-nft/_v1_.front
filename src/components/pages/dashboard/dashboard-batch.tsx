import React from "react";
import ClaimModal from "../../modals/claim-modal";
import ReturnModal from "../../modals/return-modal";
import StopLendModal from "../../modals/stop-lend-modal";

export const DashboardBatch: React.FC<{
  isReturnModalOpen: boolean;
  isLendModalOpen: boolean;
  checkedRentingItems: Set<string>;
  toggleReturnModal: (b: boolean) => void;
  checkedLendingItems: Set<string>;
  toggleLendModal: (b: boolean) => void;
  handleReset: (r: Set<string>) => void;
  isClaimModalOpen: boolean;
  checkedClaims: Set<string>;
  toggleClaimModal: (b: boolean) => void;
}> = ({
  isReturnModalOpen,
  checkedRentingItems,
  toggleReturnModal,
  isLendModalOpen,
  checkedLendingItems,
  toggleLendModal,
  handleReset,
  isClaimModalOpen,
  checkedClaims,
  toggleClaimModal
}) => {
  return (
    <>
      {isReturnModalOpen && (
        <ReturnModal
          checkedItems={checkedRentingItems}
          open={isReturnModalOpen}
          onClose={() => {
            toggleReturnModal(false);
            handleReset(checkedRentingItems);
          }}
        />
      )}
      {isLendModalOpen && (
        <StopLendModal
          checkedItems={checkedLendingItems}
          open={isLendModalOpen}
          onClose={() => {
            toggleLendModal(false);
            handleReset(checkedLendingItems);
          }}
        />
      )}
      {isClaimModalOpen && (
        <ClaimModal
          checkedItems={checkedClaims}
          open={isClaimModalOpen}
          onClose={() => {
            toggleClaimModal(false);
            handleReset(checkedClaims);
          }}
        />
      )}
    </>
  );
};
