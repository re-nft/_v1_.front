import React, { useCallback } from "react";

import { Button } from "renft-front/components/common/button";
import { TransactionWrapper } from "renft-front/components/transaction-wrapper";
import { Nft, Renting } from "renft-front/types/classes";
import { useReturnIt } from "renft-front/hooks/contract/useReturnIt";
import { useNFTApproval } from "renft-front/hooks/contract/useNFTApproval";
import { useRentingStore } from "renft-front/hooks/store/useNftStore";

import Modal from "./modal";

type ReturnModalProps = {
  checkedItems: string[];
  open: boolean;
  onClose: (nfts?: Nft[]) => void;
};

export const ReturnModal: React.FC<ReturnModalProps> = ({
  checkedItems,
  open,
  onClose
}) => {
  const { returnIt, status } = useReturnIt();

  const selectedToReturn = useRentingStore(
    useCallback(
      (state) => {
        const set = new Set(checkedItems)
        return state.userRenting.filter((r: Renting) => set.has(r.id));
      },
      [checkedItems]
    )
  );
  const { handleApproveAll, isApproved, approvalStatus } =
    useNFTApproval(selectedToReturn);

  const handleReturnNft = useCallback(() => {
    returnIt(selectedToReturn);
  }, [selectedToReturn, returnIt]);

  return (
    <Modal open={open} handleClose={onClose}>
      <div className="font-body">
        <div className="text-xl">Do you want to return?</div>
        <div className="py-3 flex flex-auto items-end justify-center">
          {!isApproved && (
            <TransactionWrapper
              isLoading={approvalStatus.isLoading}
              status={approvalStatus.status}
              transactionHashes={approvalStatus.transactionHash}
            >
              <Button
                description="Approve Return"
                disabled={approvalStatus.isLoading}
                onClick={handleApproveAll}
              />
            </TransactionWrapper>
          )}
          {isApproved && (
            <TransactionWrapper
              isLoading={status.isLoading}
              closeWindow={onClose}
              status={status.status}
              transactionHashes={status.transactionHash}
            >
              <Button
                description={
                  checkedItems && checkedItems.length > 1 ? "Return All NFTs" : "Return NFT"
                }
                disabled={approvalStatus.isLoading || !isApproved}
                onClick={handleReturnNft}
              />
            </TransactionWrapper>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReturnModal;
