import React, { useCallback, useContext, useEffect, useState } from "react";
import { Button } from "../components/common/button";
import { TransactionWrapper } from "../components/transaction-wrapper";
import createCancellablePromise from "../contexts/create-cancellable-promise";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import { Nft, Renting } from "../contexts/graph/classes";
import { SnackAlertContext } from "../contexts/SnackProvider";
import { useContractAddress } from "../contexts/StateProvider";
import TransactionStateContext from "../contexts/TransactionState";
import UserContext from "../contexts/UserProvider";
import { useObservable } from "../hooks/useObservable";
import { useReturnIt } from "../hooks/useReturnIt";
import isApprovalForAll from "../services/is-approval-for-all";
import {
  useSetApprovalAll
} from "../hooks/useSetApprovalAll";
import Modal from "./modal";

type ReturnModalProps = {
  nfts: Renting[];
  open: boolean;
  onClose: (nfts?: Nft[]) => void;
};

export const ReturnModal: React.FC<ReturnModalProps> = ({
  nfts,
  open,
  onClose
}) => {
  const { setHash } = useContext(TransactionStateContext);
  const returnIt = useReturnIt();
  const contractAddress = useContractAddress();
  const currentAddress = useContext(CurrentAddressWrapper);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [nonApprovedNft, setNonApprovedNfts] = useState<Nft[]>([]);
  const { web3Provider: provider } = useContext(UserContext);
  const { setError } = useContext(SnackAlertContext);
  const [returnT, setReturnObservable] = useObservable();
  const setApprovalForAll = useSetApprovalAll(nonApprovedNft, currentAddress);
  const [approvalStatus, setObservable] = useObservable();

  useEffect(() => {
    if (!currentAddress) return;
    setIsApproved(false);
    const transaction = createCancellablePromise(
      isApprovalForAll(nfts, currentAddress, contractAddress)
    );
    transaction.promise
      .then(([status, nonApproved]) => {
        if (status) setIsApproved(status);
        setNonApprovedNfts(nonApproved);
      })
      .catch(() => {
        console.warn("batch lend issue with is approval for all");
      });
    return transaction.cancel;
  }, [nfts, currentAddress, setIsApproved, contractAddress]);

  const handleApproveAll = useCallback(() => {
    if (!provider) return;
    setObservable(setApprovalForAll);
  }, [provider]);

  const handleReturnNft = useCallback(() => {
    setReturnObservable(returnIt(nfts));
  }, [returnIt, nfts]);

  return (
    <Modal open={open} handleClose={onClose}>
      <div className="modal-dialog-section">
        <div className="modal-dialog-title">Do you want to return?</div>
        <div className="modal-dialog-button">
          {!isApproved && (
            <TransactionWrapper
              isLoading={approvalStatus.isLoading}
              status={approvalStatus.status}
              transactionHashes={approvalStatus.transactionHash}
            >
              <Button
                description="Approve Return"
                disabled={approvalStatus.isLoading}
                handleClick={handleApproveAll}
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
                handleClick={handleReturnNft}
              />
            </TransactionWrapper>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReturnModal;
