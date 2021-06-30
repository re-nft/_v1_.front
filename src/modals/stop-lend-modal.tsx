import React, { useCallback, useState } from "react";
import { Button } from "../components/button";
import { TransactionWrapper } from "../components/transaction-wrapper";
import { Lending } from "../contexts/graph/classes";
import { ReturnNft } from "../hooks/useReturnIt";
import { useStopLend } from "../hooks/useStopLend";
import { TransactionStateEnum } from "../types";
import Modal from "./modal";

type ReturnModalProps = {
  open: boolean;
  onClose: (nfts?: ReturnNft[]) => void;
  nfts: Lending[];
};

export const StopLendModal: React.FC<ReturnModalProps> = ({
  open,
  onClose,
  nfts
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(TransactionStateEnum.PENDING);
  const stopLending = useStopLend();
  
  const handleStopLend = useCallback(async () => {
    setIsLoading(true)
    setStatus(TransactionStateEnum.PENDING)
    const items = nfts.map((nft) => ({ ...nft, lendingId: nft.lending.id }))
    const isSuccess = await stopLending(items)
      .then((r) => r)
      .catch((e) => {
        setIsLoading(false);
        setStatus(TransactionStateEnum.FAILED);
      });
    setStatus(
      isSuccess ? TransactionStateEnum.SUCCESS : TransactionStateEnum.FAILED
    );
    setIsLoading(false)
  }, [nfts, stopLending]);

  return (
    <Modal open={open} handleClose={() => onClose()}>
      <div className="modal-dialog-section">
        <div className="modal-dialog-title">Do you want to stop lending?</div>
        <div className="modal-dialog-button">
            <TransactionWrapper
              isLoading={isLoading}
              closeWindow={onClose}
              status={status}
            >
              <Button
                description={nfts.length > 1 ? "Stop Lend All" : "Stop Lend"}
                disabled={isLoading}
                handleClick={handleStopLend}
              />
            </TransactionWrapper>
        </div>
      </div>
    </Modal>
  );
};

export default StopLendModal;
