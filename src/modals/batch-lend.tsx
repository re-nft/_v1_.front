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
import { ProviderContext } from "../hardhat/SymfoniContext";
import { useContractAddress } from "../contexts/StateProvider";
import { LendForm, LendInputDefined } from "../forms/lend-form";

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
  const { setHash, hash } = useContext(TransactionStateContext);
  const currentAddress = useContext(CurrentAddressWrapper);
  const [provider] = useContext(ProviderContext);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isApprovalLoading, setIsApprovalLoading] = useState<boolean>(false);
  const [nonApprovedNft, setNonApprovedNfts] = useState<Nft[]>([]);
  const startLend = useStartLend();
  const contractAddress = useContractAddress();

  const handleLend = useCallback(
    (lendingInputs: LendInputDefined[]) => {
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
      return transaction.promise
        .then((tx) => {
          if (tx) return setHash(tx.hash);
          Promise.resolve(false);
        })
        .then((status) => {
          if (status) onClose();
        });
    },

    [startLend, nfts, onClose, setHash]
  );

  useEffect(() => {
    if (!provider) return;
    if (!hash) return;
    const fetchRequest = createCancellablePromise(
      provider.getTransactionReceipt(hash)
    );
    setIsApproved(false);
    fetchRequest.promise
      .then((receipt) => {
        const status = receipt?.status ?? 0;
        if (status === 1) setIsApproved(true);
      })
      .catch(() => {
        console.warn("issue pulling txn receipt in batch lend");
        return undefined;
      });
    return fetchRequest.cancel;
  }, [hash, provider]);

  const handleApproveAll = useCallback(() => {
    if (!provider) return;
    const transaction = createCancellablePromise(
      setApprovalForAll(nonApprovedNft, contractAddress)
    );
    setIsApproved(false);
    setIsApprovalLoading(true);
    transaction.promise
      //TODO this is wrong, all transactions needs to be tracked
      .then(([tx]) => {
        if (!tx) return Promise.resolve(false);
        return setHash(tx.hash);
      })
      .then((status) => {
        setIsApproved(status);
        setIsApprovalLoading(false);
      })
      .catch((e) => {
        console.log(e);
        console.warn("issue approving all in batch lend");
        setIsApprovalLoading(false);
        return [undefined];
      });

    return () => {
      transaction.cancel();
    };
  }, [contractAddress, nonApprovedNft, provider, setHash]);

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
