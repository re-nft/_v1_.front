import React, { useCallback } from "react";
import { Button } from "../common/button";
import { TransactionWrapper } from "../transaction-wrapper";
import { Nft, Lending } from "../../contexts/graph/classes";
import { useClaimcollateral } from "../../hooks/contract/useClaimcollateral";
import { useObservable } from "../../hooks/useObservable";
import Modal from "./modal";

type ReturnModalProps = {
  open: boolean;
  onClose: (nfts?: Nft[]) => void;
  nfts: Lending[];
};

export const ClaimModal: React.FC<ReturnModalProps> = ({
  open,
  onClose,
  nfts,
}) => {
  const claim = useClaimcollateral();
  const [t, setObservable] = useObservable();

  const handleClaim = useCallback(() => {
    setObservable(claim(nfts));
  }, [nfts, claim, setObservable]);

  return (
    <Modal open={open} handleClose={() => onClose()}>
      <div className="modal-dialog-section">
        <div className="modal-dialog-title">Do you want to claim?</div>
        <div className="py-3 flex flex-auto items-end justify-center">
          <TransactionWrapper
            isLoading={t.isLoading}
            closeWindow={onClose}
            status={t.status}
            transactionHashes={t.transactionHash}
          >
            <Button
              description={nfts.length > 1 ? "Claim All" : "Claim"}
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
