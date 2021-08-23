import React, { useCallback } from "react";
import { Button } from "../common/button";
import { TransactionWrapper } from "../transaction-wrapper";
import { Nft, Renting } from "../../contexts/graph/classes";
import { useObservable } from "../../hooks/useObservable";
import { useReturnIt } from "../../hooks/contract/useReturnIt";
import Modal from "./modal";
import { useNFTApproval } from "../../hooks/contract/useNFTApproval";

type ReturnModalProps = {
  nfts: Renting[];
  open: boolean;
  onClose: (nfts?: Nft[]) => void;
};

export const ReturnModal: React.FC<ReturnModalProps> = ({
  nfts,
  open,
  onClose,
}) => {
  const returnIt = useReturnIt();
  const [returnT, setReturnObservable] = useObservable();
  const { handleApproveAll, isApproved, approvalStatus } = useNFTApproval(nfts);

  const handleReturnNft = useCallback(() => {
    setReturnObservable(returnIt(nfts));
  }, [nfts, returnIt, setReturnObservable]);

  return (
    <Modal open={open} handleClose={onClose}>
      <div className="modal-dialog-section">
        <div className="modal-dialog-title">Do you want to return?</div>
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
                description={nfts.length > 1 ? "Return All NFTs" : "Return NFT"}
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
