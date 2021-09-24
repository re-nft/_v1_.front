import React, { useCallback, useState } from "react";
import { Button } from "../common/button";
import { TransactionWrapper } from "../transaction-wrapper";
import { Nft } from "../../types/classes";
import { useClaimcollateral } from "../../hooks/contract/useClaimCollateral";
import Modal from "./modal";
import { useLendingStore } from "../../hooks/store/useNftStore";

type ReturnModalProps = {
  open: boolean;
  onClose: (nfts?: Nft[]) => void;
  checkedItems: string[];
};

export const ClaimModal: React.FC<ReturnModalProps> = ({
  open,
  onClose,
  checkedItems
}) => {
  const {claim, status} = useClaimcollateral();
  const selectedToClaim = useLendingStore(
    useCallback(
      (state) => {
        return checkedItems.map(i => state.lendings[i])
      },
      [checkedItems]
    )
  );
  const handleClaim = useCallback(() => {
    claim(selectedToClaim);
  }, [selectedToClaim, claim]);

  return (
    <Modal open={open} handleClose={() => onClose()}>
      <div className="font-body">
        <div className="text-xl">Do you want to claim?</div>
        <div className="py-3 flex flex-auto items-end justify-center">
          <TransactionWrapper
            isLoading={status.isLoading}
            closeWindow={onClose}
            status={status.status}
            transactionHashes={status.transactionHash}
          >
            <Button
              description={selectedToClaim.length > 1 ? "Claim All" : "Claim"}
              disabled={status.isLoading}
              onClick={handleClaim}
            />
          </TransactionWrapper>
        </div>
      </div>
    </Modal>
  );
};

export default ClaimModal;
