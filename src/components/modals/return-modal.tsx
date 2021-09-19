import React, { useCallback } from "react";
import { Button } from "../common/button";
import { TransactionWrapper } from "../transaction-wrapper";
import { Nft } from "../../types/classes";
import { useObservable } from "../../hooks/useObservable";
import { useReturnIt } from "../../hooks/contract/useReturnIt";
import Modal from "./modal";
import { useNFTApproval } from "../../hooks/contract/useNFTApproval";
import { useRentingStore } from "../../hooks/queries/useNftStore";

type ReturnModalProps = {
  checkedItems: Set<string>;
  open: boolean;
  onClose: (nfts?: Nft[]) => void;
};

export const ReturnModal: React.FC<ReturnModalProps> = ({
  checkedItems,
  open,
  onClose
}) => {
  const returnIt = useReturnIt();
  const [returnT, setReturnObservable] = useObservable();

  const selectedToReturn = useRentingStore(
    useCallback(
      (state) => {
        return Object.values(state.rentings).filter((l) =>
          checkedItems.has(l.id)
        );
      },
      [checkedItems]
    )
  );
  const { handleApproveAll, isApproved, approvalStatus } =
    useNFTApproval(selectedToReturn);

  const handleReturnNft = useCallback(() => {
    setReturnObservable(returnIt(selectedToReturn));
  }, [selectedToReturn, returnIt, setReturnObservable]);

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
              isLoading={returnT.isLoading}
              closeWindow={onClose}
              status={returnT.status}
              transactionHashes={returnT.transactionHash}
            >
              <Button
                description={
                  checkedItems.size > 1 ? "Return All NFTs" : "Return NFT"
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
