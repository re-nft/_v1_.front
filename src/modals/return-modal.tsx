import React, { useCallback, useContext, useEffect, useState } from "react";
import { Button } from "../components/button";
import createCancellablePromise from "../contexts/create-cancellable-promise";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import { Nft, Renting } from "../contexts/graph/classes";
import { SnackAlertContext } from "../contexts/SnackProvider";
import { useContractAddress } from "../contexts/StateProvider";
import TransactionStateContext from "../contexts/TransactionState";
import UserContext from "../contexts/UserProvider";
import { ReturnNft, useReturnIt } from "../hooks/useReturnIt";
import isApprovalForAll from "../services/is-approval-for-all";
import setApprovalForAll from "../services/set-approval-for-all";
import Modal from "./modal";

type ReturnModalProps = {
  nfts: Renting[];
  open: boolean;
  onClose: (nfts?: ReturnNft[]) => void;
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

  useEffect(() => {
    if (!currentAddress) return;
    setIsApproved(false);
    const transaction = createCancellablePromise(
      isApprovalForAll(nfts, currentAddress, contractAddress)
    );
    transaction.promise
      .then(([isApproved, nonApproved]) => {
        if (isApproved) setIsApproved(isApproved);
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
    transaction.promise
      .then((hashes) => {
        if (hashes.length < 1) return Promise.resolve(false);
        return setHash(hashes.map((tx) => tx.hash));
      })
      .then((status) => {
        if (!status) setError("Transaction is not successful!", "warning");
        setIsApproved(status);
        setIsApprovalLoading(false);
      })
      .catch((e) => {
        console.warn("issue approving all in batch lend");
        setError(e.message, "error");
        setIsApprovalLoading(false);
        return [undefined];
      });

    return () => {
      transaction.cancel();
    };
  }, [contractAddress, nonApprovedNft, provider, setError, setHash]);

  const handleReturnNft = useCallback(async () => {
    const items = nfts.map((item) => ({
      id: item.id,
      address: item.address,
      tokenId: item.tokenId,
      lendingId: item.renting.lendingId,
      amount: item.renting.lending.lentAmount,
      contract: item.contract,
    }));
    const isSuccess = await returnIt(items);
    if (isSuccess) {
      onClose(items);
    }
  }, [returnIt, onClose, nfts]);

  return (
    <Modal open={open} handleClose={() => onClose()}>
      <div className="modal-dialog-section">
        <div className="modal-dialog-title">Do you want to return?</div>
        <div className="modal-dialog-button">
          {!isApproved && (
            <Button
              description="Approve Return"
              disabled={isApprovalLoading}
              handleClick={handleApproveAll}
            />
          )}
          {isApproved && (
            <Button
              description={nfts.length > 1 ? "Return All" : "Return It"}
              disabled={isApprovalLoading || !isApproved}
              handleClick={handleReturnNft}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReturnModal;
