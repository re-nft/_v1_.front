import { useCallback, useEffect } from "react";
import { catchError, EMPTY, from, map, Observable, of, zipAll } from "rxjs";
import { Web3Provider } from "@ethersproject/providers";
import { TransactionReceipt } from "@ethersproject/abstract-provider";

import { TransactionHash, TransactionStateEnum } from "renft-front/types";
import { IS_PROD, SECOND_IN_MILLISECONDS } from "renft-front/consts";
import {
  ErrorType,
  useSnackProvider,
} from "renft-front/hooks/store/useSnackProvider";
import { useWallet } from "renft-front/hooks/store/useWallet";

import produce from "immer";
import create from "zustand";
import shallow from "zustand/shallow";

const NUMBER_OF_CONFIRMATIONS = IS_PROD ? 3 : 1; //let's make it 5, so graph has time to sync
const TRANSACTION_TIMEOUT = 10 * 60 * SECOND_IN_MILLISECONDS;

const waitForTransactions = (
  hashes: TransactionHash[],
  provider: Web3Provider | undefined,
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
type UseTransactionState = {
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
};
const useTransactionState = create<UseTransactionState>((set) => ({
  transactions: {},
  pendingTransactions: [],
  setTransactions: (key: string, transactions: TransactionState) =>
    set(
      produce((draft: UseTransactionState) => {
        draft.transactions[key] = transactions;
      })
    ),
  addTransactionId: (key: string) =>
    set(
      produce((draft: UseTransactionState) => {
        draft.pendingTransactions.push(key);
      })
    ),

  removeTransactionId: (keys: string[]) =>
    set(
      produce((draft: UseTransactionState) => {
        if (keys.length === 0) return;
        const set = new Set(draft.pendingTransactions);
        keys.forEach((key) => {
          set.delete(key);
        });
        draft.pendingTransactions = Array.from(set);
      })
    ),
}));
// simple transaction manager
export const useTransactions = (): {
  setHash: (h: TransactionHash | TransactionHash[]) => string | false;
  transactions: Record<string, TransactionState>;
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
    (receipt: TransactionReceipt | null): boolean => {
      if (!receipt) return false;
      const status = receipt.status;
      if (status == null) return false;
      return TransactionStateEnum[status] === TransactionStateEnum[state];
    };
  const getTransactionsStatus = useCallback(
    (receipts: (TransactionReceipt | null)[] | undefined) => {
      if (!receipts) return [true, false];
      if (receipts && receipts.length < 1) return [true, false];

      const hasFailure: boolean =
        receipts.filter(transactionSucceeded(TransactionStateEnum.FAILED - 1))
          .length > 0;
      const hasPending: boolean =
        receipts.filter(transactionSucceeded(TransactionStateEnum.PENDING - 1))
          .length > 0;
      // TODO this is where state management will come in to make this easy
      if (hasFailure) setError("Transaction is not successful!", "warning");
      if (!hasFailure && !hasPending)
        setError("Transaction is success!", "success");
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
          hasPending: false,
        });
      const transaction = transactions[key];
      if (transaction.hasFailure)
        return of({
          key,
          hasFailure: true,
          hasPending: false,
        });
      return waitForTransactions(transaction.hashes, provider, setError).pipe(
        map((receipts) => {
          const [hasFailure, hasPending] = getTransactionsStatus(receipts);
          setTransactions(key, {
            hashes: transactions[key].hashes,
            receipts,
            hasFailure,
            hasPending,
          });
          return {
            key,
            hasFailure,
            hasPending,
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
        hasPending: true,
      });
      const key = hashes[0];
      addTransactionId(key);
      return key;
    },
    [provider, setTransactions, addTransactionId]
  );
  useEffect(() => {
    const subscription = from(pendingTransactions.map((t) => getHashStatus(t)))
      .pipe(
        zipAll(),
        map((statuses: TransactionStatus[]) => {
          const ids: string[] = [];
          statuses.map((status) => {
            if (status.hasFailure) ids.push(status.key);
            if (!status.hasFailure && !status.hasPending) ids.push(status.key);
          });
          removeTransactionId(ids);
        })
      )
      .subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [getHashStatus, pendingTransactions, removeTransactionId]);
  return { setHash, transactions };
};
