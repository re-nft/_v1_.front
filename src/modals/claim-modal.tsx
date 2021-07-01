import React, { useCallback, useState } from "react";
import { Button } from "../components/button";
import { TransactionWrapper } from "../components/transaction-wrapper";
import { Lending } from "../contexts/graph/classes";
import { useClaimColleteral } from "../hooks/useClaimColleteral";
import { ReturnNft } from "../hooks/useReturnIt";
import { TransactionStateEnum } from "../types";
import Modal from "./modal";

type ReturnModalProps = {
  open: boolean;
  onClose: (nfts?: ReturnNft[]) => void;
  nfts: Lending[];
};

export const ClaimModal: React.FC<ReturnModalProps> = ({
  open,
  onClose,
  nfts
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(TransactionStateEnum.PENDING);
  const claim = useClaimColleteral();
  
  const claimCollateral = useCallback(
    async (items: Lending[]) => {
      const claims = items.map((lending) => ({
        address: lending.address,
        tokenId: lending.tokenId,
        lendingId: lending.id,
        amount: lending.amount,
      }));
      return claim(claims).then((status) => {
        // if (status)
        //   handleResetLending(items.map((i) => getUniqueCheckboxId(i)));
        return Promise.resolve(status)  
      });
    },
    [claim]
  );
  const handleClaim = useCallback(async () => {
    setIsLoading(true)
    setStatus(TransactionStateEnum.PENDING)
    const isSuccess = await claimCollateral(nfts)
      .then((r) => r)
      .catch((e) => {
        setIsLoading(false);
        setStatus(TransactionStateEnum.FAILED);
      });
    setStatus(
      isSuccess ? TransactionStateEnum.SUCCESS : TransactionStateEnum.FAILED
    );
    setIsLoading(false)
  }, [claimCollateral, nfts]);

  return (
    <Modal open={open} handleClose={() => onClose()} >
      <div className="modal-dialog-section">
        <div className="modal-dialog-title">Do you want to claim?</div>
        <div className="modal-dialog-button">
            <TransactionWrapper
              isLoading={isLoading}
              closeWindow={onClose}
              status={status}
            >
              <Button
                description={nfts.length > 1 ? "Claim All" : "Claim"}
                disabled={isLoading}
                handleClick={handleClaim}
              />
            </TransactionWrapper>
        </div>
      </div>
    </Modal>
  );
};

export default ClaimModal;
