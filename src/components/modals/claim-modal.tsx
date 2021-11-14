import React, { useCallback } from "react";

import { Button } from "renft-front/components/common/button";
import { TransactionWrapper } from "renft-front/components/transaction-wrapper";
import { Nft } from "renft-front/types/classes";
import { useClaimcollateral } from "renft-front/hooks/contract/useClaimCollateral";
import { useLendingStore } from "renft-front/hooks/store/useNftStore";

import Modal from "./modal";

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
  const { claim, status } = useClaimcollateral();
  const selectedToClaim = useLendingStore(
    useCallback(
      (state) => {
        return checkedItems.map((i) => state.lendings[i]);
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
