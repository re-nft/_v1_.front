import React, { useCallback } from "react";
import { Button } from "../components/common/button";
import { TransactionWrapper } from "../components/transaction-wrapper";
import { Nft, Lending } from "../contexts/graph/classes";
import { useClaim } from "../hooks/contract/useClaim";
import { useObservable } from "../hooks/useObservable";
import Modal from "./modal";


type ReturnModalProps = {
  open: boolean;
  onClose: (nfts?: Nft[]) => void;
  nfts: Lending[];
};

export const ClaimModal: React.FC<ReturnModalProps> = ({
  open,
  onClose,
  nfts
}) => {
  const claim = useClaim();
  const [t, setObservable] = useObservable()
  
  const handleClaim = useCallback(() => {
    setObservable(claim(nfts));
  }, [nfts, claim, setObservable]);

  return (
    <Modal open={open} handleClose={() => onClose()} >
      <div className="modal-dialog-section">
        <div className="modal-dialog-title">Do you want to claim?</div>
        <div className="modal-dialog-button">
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
