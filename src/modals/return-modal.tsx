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
import { useReturnIt } from "../hooks/useReturnIt";
import isApprovalForAll from "../services/is-approval-for-all";
import setApprovalForAll from "../services/set-approval-for-all";
import { TransactionStateEnum } from "../types";
import Modal from "./modal";

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
  const { setHash } = useContext(TransactionStateContext);
  const returnIt = useReturnIt();
  const contractAddress = useContractAddress();
  const currentAddress = useContext(CurrentAddressWrapper);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isApprovalLoading, setIsApprovalLoading] = useState<boolean>(false);
  const [nonApprovedNft, setNonApprovedNfts] = useState<Nft[]>([]);
  const { web3Provider: provider } = useContext(UserContext);
  const { setError } = useContext(SnackAlertContext);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(TransactionStateEnum.PENDING);

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
    const transaction = createCancellablePromise(
      setApprovalForAll(nonApprovedNft, contractAddress)
    );
    setIsApproved(false);
    setIsApprovalLoading(true);
    setStatus(TransactionStateEnum.PENDING);
    transaction.promise
      .then((hashes) => {
        if (hashes.length < 1) return Promise.resolve(false);
        return setHash(hashes.map((tx) => tx.hash));
      })
      .then((status) => {
        if (!status) setError("Transaction is not successful!", "warning");
        setIsApproved(status);
        setIsApprovalLoading(false);
        setStatus(
          status ? TransactionStateEnum.SUCCESS : TransactionStateEnum.FAILED
        );
      })
      .catch((e) => {
        console.warn("issue approving all in batch lend");
        setError(e.message, "error");
        setIsApprovalLoading(false);
        setStatus(TransactionStateEnum.FAILED);
        return [undefined];
      });

    return () => {
      transaction.cancel();
    };
  }, [contractAddress, nonApprovedNft, provider, setError, setHash]);

  const handleReturnNft = useCallback(async () => {
    setIsLoading(true);
    setStatus(TransactionStateEnum.PENDING);
    const isSuccess = await returnIt(nfts)
      .then((r) => r)
      .catch((e) => {
        setIsLoading(false);
        setStatus(TransactionStateEnum.FAILED);
      });
    setStatus(
      isSuccess ? TransactionStateEnum.SUCCESS : TransactionStateEnum.FAILED
    );
    setIsLoading(false);
  }, [returnIt, nfts]);

  return (
    <Modal open={open} handleClose={() => onClose()}>
      <div className="modal-dialog-section">
        <div className="modal-dialog-title">Do you want to return?</div>
        <div className="modal-dialog-button">
          {!isApproved && (
            <TransactionWrapper
              isLoading={isApprovalLoading}
              status={status}
            >
              <Button
                description="Approve Return"
                disabled={isApprovalLoading}
                handleClick={handleApproveAll}
              />
            </TransactionWrapper>
          )}
          {isApproved && (
            <TransactionWrapper
              isLoading={isLoading}
              closeWindow={onClose}
              status={status}
            >
              <Button
                description={nfts.length > 1 ? "Return All" : "Return It"}
                disabled={isApprovalLoading || !isApproved}
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
