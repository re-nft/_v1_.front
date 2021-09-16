import React, { useMemo } from "react";
import MultipleBatchBar from "../../multiple-batch-bar";
import { Lending, Renting } from "../../../types/classes";
import ClaimModal from "../../modals/claim-modal";
import ReturnModal from "../../modals/return-modal";
import StopLendModal from "../../modals/stop-lend-modal";

export const DashboardBatch: React.FC<{
  isReturnModalOpen: boolean;
  isLendModalOpen: boolean;
  checkedRentingItems: Renting[];
  toggleReturnModal: (b: boolean) => void;
  handleResetRenting: (r: string[]) => void;
  checkedLendingItems: Lending[];
  toggleLendModal: (b: boolean) => void;
  handleResetLending: (r: string[]) => void;
  isClaimModalOpen: boolean;
  checkedClaims: Lending[];
  toggleClaimModal: (b: boolean) => void;
}> = ({
  isReturnModalOpen,
  checkedRentingItems,
  toggleReturnModal,
  handleResetRenting,
  isLendModalOpen,
  checkedLendingItems,
  toggleLendModal,
  handleResetLending,
  isClaimModalOpen,
  checkedClaims,
  toggleClaimModal,
}) => {
  const checkedClaimsLength = useMemo(() => {
    return checkedClaims.length;
  }, [checkedClaims]);
  const checkedRentingLength = useMemo(() => {
    return checkedRentingItems.length;
  }, [checkedRentingItems]);
  const lendinItemsStopLendableLength = useMemo(() => {
    return checkedLendingItems.length;
  }, [checkedLendingItems]);
  const lendinItemsStopLendable = useMemo(() => {
    return checkedLendingItems.filter((v) => !v.hasRenting);
  }, [checkedLendingItems]);
  return (
    <>
      {isReturnModalOpen && (
        <ReturnModal
          nfts={checkedRentingItems}
          open={isReturnModalOpen}
          onClose={() => {
            toggleReturnModal(false);
            handleResetRenting(checkedRentingItems.map((i) => i.id));
          }}
        />
      )}
      {isLendModalOpen && (
        <StopLendModal
          nfts={lendinItemsStopLendable}
          open={isLendModalOpen}
          onClose={() => {
            toggleLendModal(false);
            handleResetLending(lendinItemsStopLendable.map((i) => i.id));
          }}
        />
      )}
      {isClaimModalOpen && (
        <ClaimModal
          nfts={checkedClaims}
          open={isClaimModalOpen}
          onClose={() => {
            toggleClaimModal(false);
            handleResetLending(checkedClaims.map((i) => i.id));
          }}
        />
      )}
      <MultipleBatchBar
        claimsNumber={checkedClaimsLength}
        rentingNumber={checkedRentingLength}
        lendingNumber={lendinItemsStopLendableLength}
        onClaim={() => {
          toggleClaimModal(true);
        }}
        onStopRent={() => {
          toggleReturnModal(true);
        }}
        onStopLend={() => {
          toggleLendModal(true);
        }}
      />
    </>
  );
};
