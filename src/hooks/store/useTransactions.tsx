import { useCallback, useEffect } from "react";
// TODO: otherwise it takes it from packages/front and crashes everything
import { TransactionReceipt } from "@ethersproject/abstract-provider";

import { TransactionHash, TransactionStateEnum } from "../../types";
import { IS_PROD, SECOND_IN_MILLISECONDS } from "../../consts";

import { catchError, EMPTY, from, map, Observable, of, zipAll } from "rxjs";
import { ethers } from "ethers";
import { ErrorType, useSnackProvider } from "./useSnackProvider";
import { useWallet } from "./useWallet";

import produce from "immer";
import create from "zustand";
import shallow from "zustand/shallow";

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

export type TransactionState = {
  hashes: TransactionHash[];
  receipts: (TransactionReceipt | null)[] | undefined;
  hasFailure: boolean;
  hasPending: boolean;
};
export type TransactionStatus = {
  key: string;
  hasFailure: boolean;
  hasPending: boolean;
};

const useTransactionState = create<{
  // start lend transactions
  // start rent transactions
  // claim transactions
  // return transactions
  // stop lend transactions
  transactions: Record<string, TransactionState>;
  pendingTransactions: string[];
  setTransactions: (key: string, t: TransactionState) => void;
  removeTransactionId: (keys: string[]) => void;
  addTransactionId: (keys: string) => void;
}>((set) => ({
  transactions: {},
  pendingTransactions: [],
  setTransactions: (key: string, transactions: TransactionState) =>
    set(
      produce((state) => {
        state.transactions[key] = transactions;
      })
    ),
  addTransactionId: (key: string) =>
    set(
      produce((state) => {
        state.pendingTransactions.push(key);
      })
    ),

  removeTransactionId: (keys: string[]) =>
    set(
      produce((state) => {
        if (keys.length === 0) return;
        const set = new Set(state.pendingTransactions);
        keys.forEach((key) => {
          set.delete(key);
        });
        state.pendingTransactions = Array.from(set);
      })
    )
}));
// simple transaction manager
export const useTransactions = (): {
  setHash: (h: TransactionHash | TransactionHash[]) => string | false;
  transactions: Record<string, TransactionState>
} => {
  const { web3Provider: provider } = useWallet();
  const transactions = useTransactionState(
    useCallback((state) => state.transactions, []),
    shallow
  );
  const pendingTransactions = useTransactionState(
    useCallback((state) => state.pendingTransactions, []),
    shallow
  );
  const setTransactions = useTransactionState((state) => state.setTransactions);
  const removeTransactionId = useTransactionState(
    (state) => state.removeTransactionId
  );
  const addTransactionId = useTransactionState(
    (state) => state.addTransactionId
  );
  const { setError } = useSnackProvider();


  const transactionSucceeded =
    (state: TransactionStateEnum) =>
      (receipt: TransactionReceipt | null) => {
        if (!receipt) return false;
        const status = receipt.status;
        if (!status) return false;
        return TransactionStateEnum[status] === TransactionStateEnum[state];
      };
  const getTransactionsStatus = useCallback(
    (receipts: (TransactionReceipt | null)[] | undefined) => {
      if (!receipts) return [true, false];
      if (receipts && receipts.length < 1) return [true, false];

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
    [setError]
  );

  const getHashStatus = useCallback(
    (key): Observable<TransactionStatus> => {
      if (!key)
        return of({
          key,
          hasFailure: true,
          hasPending: false
        });
      const transaction = transactions[key];
      if (transaction.hasFailure)
        return of({
          key,
          hasFailure: true,
          hasPending: false
        });
      return waitForTransactions(transaction.hashes, provider, setError).pipe(
        map((receipts) => {
          const [hasFailure, hasPending] = getTransactionsStatus(receipts);
          setTransactions(key, {
            hashes: transactions[key].hashes,
            receipts,
            hasFailure,
            hasPending
          });
          if (hasFailure) setError("Transaction is not successful!", "warning");
          return {
            key,
            hasFailure,
            hasPending
          };
        })
      );
    },
    [getTransactionsStatus, provider, setError, transactions, setTransactions]
  );
  const setHash = useCallback(
    (h: TransactionHash | TransactionHash[]): string | false => {
      if (!provider) {
        console.warn("cannot set transaction hash. no provider");
        return false;
      }
      const hashes = Array.isArray(h) ? h : [h];
      setTransactions(hashes[0], {
        hashes,
        receipts: [],
        hasFailure: false,
        hasPending: true
      });
      const key = hashes[0];
      addTransactionId(key);
      return key;
    },
    [
      getTransactionsStatus,
      provider,
      setError,
      transactions,
      setTransactions,
      addTransactionId
    ]
  );
  useEffect(() => {
    const subscription = from(pendingTransactions.map((t) => getHashStatus(t)))
      .pipe(
        zipAll(),
        map((statuses: TransactionStatus[]) => {
          const ids: string[] = [];
          statuses.map((status) => {
            if (status.hasFailure) ids.push(status.key);
          });
          removeTransactionId(ids);
        })
      )
      .subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [pendingTransactions]);
  return { setHash, transactions };
};
