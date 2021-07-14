import React, { createContext, useState, useCallback, useContext } from "react";
// TODO: otherwise it takes it from packages/front and crashes everything
import { TransactionReceipt } from "@ethersproject/abstract-provider";

import { TransactionHash, TransactionStateEnum } from "../types";
import { IS_PROD, SECOND_IN_MILLISECONDS } from "../consts";

import UserContext from "./UserProvider";

type TransactionStateType = {
  setHash: (h: TransactionHash | TransactionHash[]) => Promise<boolean>;
  getHashStatus: (key: string) => Promise<[boolean, boolean]>;
};

const TransactionStateDefault: TransactionStateType = {
  setHash: () => {
    throw new Error("must be implemented");
  },
  getHashStatus: () => {
    throw new Error("must be implemented");
  },
};

export const TransactionStateContext = createContext<TransactionStateType>(
  TransactionStateDefault
);
TransactionStateContext.displayName = "TransactionStateContext";

const NUMBER_OF_CONFIRMATIONS = IS_PROD ? 3: 1; //let's make it 5, so graph has time to sync
const TRANSACTION_TIMEOUT = 10 * 60 * SECOND_IN_MILLISECONDS;

// save transaction hashes for each address and hashes
export const TransactionStateProvider: React.FC = ({ children }) => {
  const { web3Provider: provider } = useContext(UserContext);
  const [transactions, setStransactions] = useState<
    Record<
      string,
      {
        hashes: TransactionHash[];
        receipts: TransactionReceipt[] | undefined;
        hasFailure: boolean;
        hasPending: boolean;
      }
    >
  >({});
  // const [receipt, setReceipt] = useState<TransactionReceipt[]>();
  // const [hash, _setHash] = useState<TransactionHash[]>([]);

  const waitForTransactions = useCallback(
    async (hashes: TransactionHash[]) => {
      if (!provider) return;

      const transactionConfirmations = hashes.map((h) => {
        return provider.waitForTransaction(
          h,
          NUMBER_OF_CONFIRMATIONS,
          TRANSACTION_TIMEOUT
        );
      });
      // blocking
      const receipts = await Promise.all(transactionConfirmations)
        .then((r) => r)
        .catch((e) => {
          console.warn("could not fetch the transaction status");
          return [];
        });
      return receipts;
    },
    [provider]
  );
  const getTransactionsStatus = useCallback(
    (receipts: TransactionReceipt[] | undefined) => {
      if (!receipts) return [true, false];
      if (receipts && receipts.length < 1) return [true, false];

      const transactionSucceeded =
        (state: TransactionStateEnum) => (receipt: TransactionReceipt) => {
          const status = receipt.status;
          if (!status) return false;
          return TransactionStateEnum[status] === TransactionStateEnum[state];
        };
      const hasFailure =
        receipts.filter(transactionSucceeded(TransactionStateEnum.FAILED))
          .length > 0;
      const hasPending =
        receipts.filter(transactionSucceeded(TransactionStateEnum.PENDING))
          .length > 0;
      // TODO this is where state management will come in to make this easy
      return [hasFailure, hasPending];
    },
    []
  );

  const getHashStatus = useCallback(
    async (key): Promise<[boolean, boolean]> => {
      if (!key) return [false, false];
      const transaction = transactions[key];
      if (!transaction) return [false, false];
      if (transaction.hasFailure || !transactions.hasPending)
        return [false, false];
      const receipts = await waitForTransactions(transaction.hashes);

      const [hasFailure, hasPending] = getTransactionsStatus(receipts);
      setStransactions((state) => ({
        ...state,
        [`${key}`]: {
          hashes: state[key].hashes,
          receipts,
          hasFailure,
          hasPending,
        },
      }));
      return [hasFailure, hasPending];
    },
    [getTransactionsStatus, transactions, waitForTransactions]
  );
  const setHash = useCallback(
    async (h: TransactionHash | TransactionHash[]) => {
      if (!provider) {
        console.warn("cannot set transaction hash. no provider");
        return false;
      }
      const hashes = Array.isArray(h) ? h : [h];
      setStransactions((state) => ({
        ...state,
        [`${hashes[0]}`]: {
          hashes,
          receipts: [],
          hasFailure: false,
          hasPending: true,
        },
      }));
      const key = hashes[0]
      const receipts = await waitForTransactions(hashes);
      const [hasFailure, hasPending] = getTransactionsStatus(receipts);
      setStransactions((state) => ({
        ...state,
        [`${key}`]: {
          hashes: state[key].hashes,
          receipts,
          hasFailure,
          hasPending,
        },
      }));
      // todo fix this
      return !hasFailure;
    },
    [getTransactionsStatus, provider, waitForTransactions]
  );

  return (
    <TransactionStateContext.Provider value={{ setHash, getHashStatus }}>
      {children}
    </TransactionStateContext.Provider>
  );
};

export default TransactionStateContext;
