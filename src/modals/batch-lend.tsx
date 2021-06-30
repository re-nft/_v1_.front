import React, { useState, useCallback, useContext, useEffect } from "react";

import Modal from "./modal";

import { TransactionStateContext } from "../contexts/TransactionState";
import { Nft } from "../contexts/graph/classes";
import isApprovalForAll from "../services/is-approval-for-all";
import setApprovalForAll from "../services/set-approval-for-all";

import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import createCancellablePromise from "../contexts/create-cancellable-promise";
import { useStartLend } from "../hooks/useStartLend";
import { BigNumber } from "@ethersproject/bignumber";
import { useContractAddress } from "../contexts/StateProvider";
import { LendForm, LendInputDefined } from "../forms/lend-form";
import { SnackAlertContext } from "../contexts/SnackProvider";
import UserContext from "../contexts/UserProvider";

type LendModalProps = {
  nfts: Nft[];
  open: boolean;
  onClose(): void;
};

export const BatchLendModal: React.FC<LendModalProps> = ({
  nfts,
  open,
  onClose,
}) => {
  const { setHash } = useContext(TransactionStateContext);
  const currentAddress = useContext(CurrentAddressWrapper);
  const { web3Provider: provider } = useContext(UserContext);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isApprovalLoading, setIsApprovalLoading] = useState<boolean>(false);
  const [nonApprovedNft, setNonApprovedNfts] = useState<Nft[]>([]);
  const startLend = useStartLend();
  const contractAddress = useContractAddress();
  const { setError } = useContext(SnackAlertContext);

  const handleLend = useCallback(
    (lendingInputs: LendInputDefined[]): Promise<[boolean | void, () => void]> => {
      const lendAmountsValues: number[] = [];
      const maxDurationsValues: number[] = [];
      const borrowPriceValues: number[] = [];
      const nftPriceValues: number[] = [];
      const addresses: string[] = [];
      const tokenIds: BigNumber[] = [];
      const pmtTokens: number[] = [];

      Object.values(lendingInputs).forEach((item) => {
        lendAmountsValues.push(item.lendAmount);
        maxDurationsValues.push(item.maxDuration);
        borrowPriceValues.push(item.borrowPrice);
        nftPriceValues.push(item.nftPrice);
        pmtTokens.push(item.pmToken);
      });
      nfts.forEach(({ address, tokenId }) => {
        addresses.push(address);
        tokenIds.push(BigNumber.from(tokenId));
      });

      const transaction = createCancellablePromise(
        startLend(
          addresses,
          tokenIds,
          lendAmountsValues,
          maxDurationsValues,
          borrowPriceValues,
          nftPriceValues,
          pmtTokens
        )
      );
      return transaction.promise.then((status) => {
        return Promise.resolve([status, onClose]);
      });
    },

    [startLend, nfts, onClose]
  );

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
      <LendForm
        nfts={nfts}
        isApproved={isApproved}
        handleApproveAll={handleApproveAll}
        handleSubmit={handleLend}
        isApprovalLoading={isApprovalLoading}
      ></LendForm>
    </Modal>
  );
};

export default BatchLendModal;
