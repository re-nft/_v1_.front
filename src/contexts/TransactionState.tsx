import React, { createContext, useState, useCallback, useContext } from "react";
import { TransactionReceipt } from "@ethersproject/abstract-provider";

import { ProviderContext } from "../hardhat/SymfoniContext";
import { TransactionHash, TransactionStateEnum } from "../types";
import { SECOND_IN_MILLISECONDS } from "../consts";

import { sleep } from "../utils";

type TransactionStateType = {
  isActive: boolean; // on if there is an active transaction;
  txnState: TransactionStateEnum;
  hash?: TransactionHash;
  receipt?: TransactionReceipt;
  setHash: (h: TransactionHash) => Promise<boolean>;
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
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [hash, _setHash] = useState<TransactionHash>();

  const delayedSetIsActive = useCallback(
    async (ms: number, _isActive: boolean) => {
      await sleep(ms);
      setIsActive(_isActive);
    },
    []
  );

  const setHash = useCallback(
    async (h: TransactionHash) => {
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

      _setHash(h);
      setIsActive(true);
      setTxnState(TransactionStateEnum.PENDING);

      const confirmations = 1;
      const timeout = 120 * SECOND_IN_MILLISECONDS;
      // blocking
      const receipt = await provider.waitForTransaction(
        h,
        confirmations,
        timeout
      );

      if (!receipt.status) {
        console.warn("could not fetch the transaction status");
        return false;
      }

      let isSuccess = false;

      // 0 is reverted
      // 1 is successful
      switch (TransactionStateEnum[receipt.status]) {
        case TransactionStateEnum[TransactionStateEnum.SUCCESS]:
          isSuccess = true;
          break;
        case TransactionStateEnum[TransactionStateEnum.FAILED]:
          break;
        default:
          console.warn(`unknown transaction state: ${receipt.status}`);
      }

      setReceipt(receipt);
      // setIsActive(false);
      await sleep(1.5 * SECOND_IN_MILLISECONDS);

      return isSuccess;
    },
    [isActive, provider]
  );

  const chainSetHash = useCallback(
    async (h: TransactionHash) => {
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
