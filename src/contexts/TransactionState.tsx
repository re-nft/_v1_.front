import React, { createContext, useState } from "react";

import { TransactionHash } from "../types";

enum TransactionStateEnum {
  PENDING,
  FAILED,
  SUCCESS,
}

type TransactionStateType = {
  isActive: boolean; // on if there is an active transaction;
  txnState?: TransactionStateEnum;
  hash?: TransactionHash;
  setIsActive: (isActive: boolean) => void;
  setTxnState: (txnState: TransactionStateEnum) => void;
  setHash: (hash: TransactionHash) => void;
};

const TransactionStateDefault: TransactionStateType = {
  isActive: false,
  setIsActive: () => {
    throw new Error("must be implemented");
  },
  setTxnState: () => {
    throw new Error("must be implemented");
  },
  setHash: () => {
    throw new Error("must be implemented");
  },
};

const TransactionStateContext = createContext<TransactionStateType>(
  TransactionStateDefault
);

// * this implementation does not guard against the developer forgetting
// * to set back the transaction to inactive for example,
// * or using state or hash when the transaction is inactive.
// * these things ideally should be corrected
const TransactionStateProvider: React.FC = ({ children }) => {
  const [isActive, setIsActive] = useState(TransactionStateDefault.isActive);
  const [txnState, setTxnState] = useState<TransactionStateEnum>();
  const [hash, setHash] = useState<TransactionHash>();
  return (
    <TransactionStateContext.Provider
      value={{ isActive, txnState, hash, setIsActive, setTxnState, setHash }}
    >
      {children}
    </TransactionStateContext.Provider>
  );
};

export default TransactionStateProvider;
