import React, { createContext, useState, useCallback, useContext } from "react";
// TODO: otherwise it takes it from packages/front and crashes everything
import { TransactionReceipt } from "@ethersproject/abstract-provider";

import { TransactionHash, TransactionStateEnum } from "../types";
import { SECOND_IN_MILLISECONDS } from "../consts";

import { sleep } from "../utils";
import { ProviderContext } from "../hardhat/SymfoniContext";

type TransactionStateType = {
  isActive: boolean; // on if there is an active transaction;
  txnState: TransactionStateEnum;
  hash?: TransactionHash[];
  receipt?: TransactionReceipt[];
  setHash: (h: TransactionHash | TransactionHash[]) => Promise<boolean>;
};

const TransactionStateDefault: TransactionStateType = {
  isActive: false,
  txnState: TransactionStateEnum.PENDING,
  setHash: () => {
    throw new Error("must be implemented");
  },
};

export const TransactionStateContext = createContext<TransactionStateType>(
  TransactionStateDefault
);
TransactionStateContext.displayName = "TransactionStateContext";

// * this implementation does not guard against the developer forgetting
// * to set back the transaction to inactive for example,
// * or using state or hash when the transaction is inactive.
// * these things ideally should be corrected
export const TransactionStateProvider: React.FC = ({ children }) => {
  const [provider] = useContext(ProviderContext);
  const [isActive, setIsActive] = useState(TransactionStateDefault.isActive);
  const [txnState, setTxnState] = useState<TransactionStateEnum>(
    TransactionStateEnum.PENDING
  );
  const [receipt, setReceipt] = useState<TransactionReceipt[]>();
  const [hash, _setHash] = useState<TransactionHash[]>([]);

  const delayedSetIsActive = useCallback(
    async (ms: number, _isActive: boolean) => {
      await sleep(ms);
      setIsActive(_isActive);
    },
    []
  );

  const setHash = useCallback(
    async (h: TransactionHash | TransactionHash[]) => {
      if (!provider) {
        console.warn("cannot set transaction hash. no provider");
        return false;
      }
      // forbid to set if there is an active transaction
      if (isActive) {
        console.warn(
          "can't set the transaction hash when there is one pending"
        );
        return false;
      }
      const hashes = Array.isArray(h) ? h : [h];
      _setHash(hashes);
      setIsActive(true);
      setTxnState(TransactionStateEnum.PENDING);

      const confirmations = 1;
      const timeout = 120 * SECOND_IN_MILLISECONDS;

      const transactionConfirmations = hashes.map((h) => {
        return provider.waitForTransaction(h, confirmations, timeout);
      });
      // blocking
      const receipts = await Promise.all(transactionConfirmations)
        .then((r) => r)
        .catch((e) => {
          console.warn("could not fetch the transaction status");
          return [];
        });
      if (receipts.length < 1) return false;

      const isSuccess =
        receipts.filter((receipt) => {
          const status = receipt.status;
          if (!status) return false;
          return (
            TransactionStateEnum[status] ===
            TransactionStateEnum[TransactionStateEnum.SUCCESS]
          );
        }).length > 0;

      setReceipt(receipts);
      // setIsActive(false);
      //await sleep(1.5 * SECOND_IN_MILLISECONDS);

      return isSuccess;
    },
    [isActive, provider]
  );

  const chainSetHash = useCallback(
    async (h: TransactionHash | TransactionHash[]) => {
      const isSuccess = await setHash(h);
      switch (isSuccess) {
        case true:
          setTxnState(TransactionStateEnum.SUCCESS);
          break;
        case false:
          setTxnState(TransactionStateEnum.FAILED);
          break;
        default:
          setTxnState(TransactionStateEnum.FAILED);
      }
      delayedSetIsActive(1.5 * SECOND_IN_MILLISECONDS, false);
      return isSuccess;
    },
    [setHash, delayedSetIsActive]
  );

  // todo: add a providers listener for a cancelled transaction
  // user may invoke this on their end

  return (
    <TransactionStateContext.Provider
      value={{ isActive, txnState, hash, receipt, setHash: chainSetHash }}
    >
      {children}
    </TransactionStateContext.Provider>
  );
};

export default TransactionStateContext;
