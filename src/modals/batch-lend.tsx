import React, { useState, useCallback, useContext, useEffect } from "react";

import Modal from "./modal";

import { Nft } from "../contexts/graph/classes";
import isApprovalForAll from "../services/is-approval-for-all";
import { useSetApprovalAll } from "../hooks/useSetApprovalAll";

import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import createCancellablePromise from "../contexts/create-cancellable-promise";
import { useStartLend } from "../hooks/useStartLend";
import { useContractAddress } from "../contexts/StateProvider";
import { LendForm, LendInputDefined } from "../forms/lend-form";
import UserContext from "../contexts/UserProvider";
import { useObservable } from "../hooks/useObservable";

type LendModalProps = {
  nfts: Nft[];
  open: boolean;
  onClose(): void;
};

export const BatchLendModal: React.FC<LendModalProps> = ({
  nfts,
  open,
  onClose
}) => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { web3Provider: provider } = useContext(UserContext);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [nonApprovedNft, setNonApprovedNfts] = useState<Nft[]>([]);
  const startLend = useStartLend();
  const contractAddress = useContractAddress();
  const setApprovalForAll = useSetApprovalAll(nonApprovedNft, currentAddress);
  const [approvalStatus, setObservable] = useObservable();
  const handleLend = useCallback(
    (lendingInputs: LendInputDefined[]) => {
      return startLend(lendingInputs);
    },

    [startLend, onClose]
  );
  const handleApproveAll = useCallback(() => {
    if (!provider) return;
    setObservable(setApprovalForAll);
  }, [provider]);

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

  return (
    <Modal open={open} handleClose={onClose}>
      {open && (
        <LendForm
          nfts={nfts}
          isApproved={isApproved}
          handleApproveAll={handleApproveAll}
          handleSubmit={handleLend}
          approvalStatus={approvalStatus}
          onClose={onClose}
        ></LendForm>
      )}
    </Modal>
  );
};

export default BatchLendModal;
