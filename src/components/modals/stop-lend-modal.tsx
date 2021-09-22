import React, { useCallback } from "react";
import { Button } from "../common/button";
import { TransactionWrapper } from "../transaction-wrapper";
import { Lending } from "../../types/classes";
import { useObservable } from "../../hooks/misc/useObservable";
import { useStopLend } from "../../hooks/contract/useStopLend";
import Modal from "./modal";
import { useLendingStore } from "../../hooks/store/useNftStore";

type ReturnModalProps = {
  open: boolean;
  onClose: (nfts?: Lending[]) => void;
  checkedItems: string[];
};

export const StopLendModal: React.FC<ReturnModalProps> = ({
  open,
  onClose,
  checkedItems
}) => {
  const stopLending = useStopLend();
  const [t, setObservable] = useObservable();
  const selectedToStopLend = useLendingStore(
    useCallback(
      (state) => {
        return checkedItems.map(i => state.lendings[i])
      },
      [checkedItems]
    )
  );
  const handleStopLend = useCallback(() => {
    const items = selectedToStopLend.map((lending) => ({
      ...lending,
      lendingId: lending.id
    }));
    setObservable(stopLending(items));
  }, [selectedToStopLend, stopLending, setObservable]);

  return (
    <Modal open={open} handleClose={onClose}>
      <div className="font-body">
        <div className="text-xl">Do you want to stop lending?</div>
        <div className="py-3 flex flex-auto items-end justify-center">
          <TransactionWrapper
            isLoading={t.isLoading}
            closeWindow={onClose}
            status={t.status}
            transactionHashes={t.transactionHash}
          >
            <Button
              description={
                selectedToStopLend.length > 1 ? "Stop Lend All" : "Stop Lend"
              }
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
