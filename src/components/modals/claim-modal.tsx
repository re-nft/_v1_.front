import React, { useCallback } from "react";
import { Button } from "../common/button";
import { TransactionWrapper } from "../transaction-wrapper";
import { Nft } from "../../types/classes";
import { useClaimcollateral } from "../../hooks/contract/useClaimCollateral";
import { useObservable } from "../../hooks/useObservable";
import Modal from "./modal";
import { useLendingStore } from "../../hooks/queries/useNftStore";

type ReturnModalProps = {
  open: boolean;
  onClose: (nfts?: Nft[]) => void;
  checkedItems: Set<string>;
};

export const ClaimModal: React.FC<ReturnModalProps> = ({
  open,
  onClose,
  checkedItems
}) => {
  const claim = useClaimcollateral();
  const [t, setObservable] = useObservable();
  const selectedToClaim = useLendingStore(
    useCallback(
      (state) => {
        return Object.values(state.lendings).filter((l) =>
          checkedItems.has(l.id)
        );
      },
      [checkedItems]
    )
  );
  const handleClaim = useCallback(() => {
    setObservable(claim(selectedToClaim));
  }, [selectedToClaim, claim, setObservable]);

  return (
    <Modal open={open} handleClose={() => onClose()}>
      <div className="font-body">
        <div className="text-xl">Do you want to claim?</div>
        <div className="py-3 flex flex-auto items-end justify-center">
          <TransactionWrapper
            isLoading={t.isLoading}
            closeWindow={onClose}
            status={t.status}
            transactionHashes={t.transactionHash}
          >
            <Button
              description={selectedToClaim.length > 1 ? "Claim All" : "Claim"}
              disabled={t.isLoading}
              onClick={handleClaim}
            />
          </TransactionWrapper>
        </div>
      </div>
    </Modal>
  );
};

export default ClaimModal;
