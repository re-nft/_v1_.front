import React, { createContext, useState, useCallback, useContext } from "react";
// TODO: otherwise it takes it from packages/front and crashes everything
import { TransactionReceipt } from "@ethersproject/abstract-provider";

import { TransactionHash, TransactionStateEnum } from "../types";
import { IS_PROD, SECOND_IN_MILLISECONDS } from "../consts";

import UserContext from "./UserProvider";
import { catchError, EMPTY, from, map, Observable, of, zipAll } from "rxjs";
import { ethers } from "ethers";
import { ErrorType, SnackAlertContext } from "./SnackProvider";

type TransactionStateType = {
  setHash: (
    h: TransactionHash | TransactionHash[]
  ) => Observable<[boolean, boolean]>;
  getHashStatus: (key: string) => Observable<[boolean, boolean]>;
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

const NUMBER_OF_CONFIRMATIONS = IS_PROD ? 3 : 1; //let's make it 5, so graph has time to sync
const TRANSACTION_TIMEOUT = 10 * 60 * SECOND_IN_MILLISECONDS;

const waitForTransactions = (
  hashes: TransactionHash[],
  provider: ethers.providers.Web3Provider | undefined,
  setError: (str: string, type: ErrorType) => void
): Observable<(TransactionReceipt | null)[]> => {
  if (!provider) return EMPTY;
  //return receipts;
  return from(hashes).pipe(
    map((hash) => {
      return from(
        provider.waitForTransaction(
          hash,
          NUMBER_OF_CONFIRMATIONS,
          TRANSACTION_TIMEOUT
        )
      ).pipe(
        catchError((err: Error) => {
          setError(err.message, "error");
          console.warn("could not fetch the transaction status", err);
          return of(null);
        })
      );
    }),
    zipAll()
  );
};
// save transaction hashes for each address and hashes
export const TransactionStateProvider: React.FC = ({ children }) => {
  const { web3Provider: provider } = useContext(UserContext);
  const [transactions, setStransactions] = useState<
    Record<
      string,
      {
        hashes: TransactionHash[];
        receipts: (TransactionReceipt | null)[] | undefined;
        hasFailure: boolean;
        hasPending: boolean;
      }
    >
  >({});
  const { setError } = useContext(SnackAlertContext);

  const getTransactionsStatus = useCallback(
    (receipts: (TransactionReceipt | null)[] | undefined) => {
      if (!receipts) return [true, false];
      if (receipts && receipts.length < 1) return [true, false];

      const transactionSucceeded =
        (state: TransactionStateEnum) =>
        (receipt: TransactionReceipt | null) => {
          if (!receipt) return false;
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
      if (hasFailure) setError("Transaction is not successful!", "warning");
      return [hasFailure, hasPending];
    },
    []
  );

  const getHashStatus = useCallback(
    (key): Observable<[boolean, boolean]> => {
      if (!key) return of([false, false]);
      const transaction = transactions[key];
      if (!transaction) return of([false, false]);
      if (transaction.hasFailure || !transactions.hasPending)
        return of([false, false]);

      return waitForTransactions(transaction.hashes, provider, setError).pipe(
        map((receipts) => {
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
          if (hasFailure) setError("Transaction is not successful!", "warning");
          return [hasFailure, hasPending];
        })
      );
    },
    [getTransactionsStatus, transactions, waitForTransactions, provider]
  );
  const setHash = useCallback(
    (
      h: TransactionHash | TransactionHash[]
    ): Observable<[boolean, boolean]> => {
      if (!provider) {
        console.warn("cannot set transaction hash. no provider");
        return of([false, false]);
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
      const key = hashes[0];

      return waitForTransactions(hashes, provider, setError).pipe(
        map((receipts) => {
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
        })
      );
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
