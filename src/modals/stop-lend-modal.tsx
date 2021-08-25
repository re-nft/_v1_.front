import React, { useCallback } from "react";
import { Button } from "../components/common/button";
import { TransactionWrapper } from "../components/transaction-wrapper";
import { Lending, Nft } from "../contexts/graph/classes";
import { useObservable } from "../hooks/useObservable";
import { useStopLend } from "../hooks/contract/useStopLend";
import Modal from "./modal";

type ReturnModalProps = {
  open: boolean;
  onClose: (nfts?: Nft[]) => void;
  nfts: Lending[];
};

export const StopLendModal: React.FC<ReturnModalProps> = ({
  open,
  onClose,
  nfts,
}) => {
  const stopLending = useStopLend();
  const [t, setObservable] = useObservable();

  const handleStopLend = useCallback(() => {
    const items = nfts.map((nft) => ({ ...nft, lendingId: nft.lending.id }));
    setObservable(stopLending(items));
  }, [nfts, stopLending, setObservable]);

  return (
    <Modal open={open} handleClose={onClose}>
      <div className="modal-dialog-section">
        <div className="modal-dialog-title">Do you want to stop lending?</div>
        <div className="modal-dialog-button">
          <TransactionWrapper
            isLoading={t.isLoading}
            closeWindow={onClose}
            status={t.status}
            transactionHashes={t.transactionHash}
          >
            <Button
              description={nfts.length > 1 ? "Stop Lend All" : "Stop Lend"}
              disabled={t.isLoading}
              onClick={handleStopLend}
            />
          </TransactionWrapper>
        </div>
      </div>
    </Modal>
  );
};

export default StopLendModal;
