import React, { createContext, useState, useCallback, useContext } from "react";
import { TransactionReceipt } from "@ethersproject/abstract-provider";

import { ProviderContext } from "../hardhat/SymfoniContext";
import { TransactionHash } from "../types";

enum TransactionStateEnum {
  FAILED,
  SUCCESS,
  PENDING,
}

type TransactionStateType = {
  isActive: boolean; // on if there is an active transaction;
  txnState?: TransactionStateEnum;
  hash?: TransactionHash;
  receipt?: TransactionReceipt;
  setHash: (h: TransactionHash) => Promise<void>;
};

const SECOND_IN_MILLISECONDS = 1_000;

const TransactionStateDefault: TransactionStateType = {
  isActive: false,
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
  const [txnState, setTxnState] = useState<TransactionStateEnum>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [hash, _setHash] = useState<TransactionHash>();

  const setHash = useCallback(
    async (h: TransactionHash) => {
      if (!provider) {
        console.warn("cannot set transaction hash. no provider");
        return;
      }
      // forbid to set if there is an active transaction
      if (isActive) {
        console.warn(
          "can't set the transaction hash when there is one pending"
        );
        return;
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
        return;
      }

      // 0 is reverted
      // 1 is successful
      switch (TransactionStateEnum[receipt.status]) {
        case TransactionStateEnum[TransactionStateEnum.SUCCESS]:
          setTxnState(TransactionStateEnum.SUCCESS);
          break;
        case TransactionStateEnum[TransactionStateEnum.FAILED]:
          setTxnState(TransactionStateEnum.FAILED);
          break;
        default:
          console.warn(`unknown transaction state: ${receipt.status}`);
      }

      setIsActive(false);
      setReceipt(receipt);
      _setHash("");
    },
    [isActive, provider]
  );

  // todo: add a providers listener for a cancelled transaction
  // user may invoke this on their end

  return (
    <TransactionStateContext.Provider
      value={{ isActive, txnState, hash, receipt, setHash }}
    >
      {children}
    </TransactionStateContext.Provider>
  );
};

export default TransactionStateContext;
