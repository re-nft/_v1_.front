import { ContractTransaction } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TransactionState, useTransactions } from "../store/useTransactions";
import { from, map, switchMap, timer } from "rxjs";
import { TransactionStateEnum } from "../../types";
import ReactGA from "react-ga";
import { useSnackProvider } from "../store/useSnackProvider";
import { SECOND_IN_MILLISECONDS } from "../../consts";
import create from "zustand";
import produce from "immer";
import shallow from "zustand/shallow";

type GAAction = { action: string; label: string; id: string; err?: unknown };
const events = {
  askForSignature: ({ action, label, id }: GAAction) => {
    ReactGA.event({
      category: "Contract interaction",
      action: `Start action:${action}`,
      label: `uniqueId:${id} ${label}`
    });
  },
  error: (ga: GAAction) => {
    const err = ga.err as any;
    ReactGA.event({
      category: "Contract interaction",
      action: `Error action:${ga.action}`,
      label: `uniqueId:${ga.id} ${err?.message}`
    });
  },
  transactionsStart: (ga: {
    action: string;
    id: string;
    transactions: ContractTransaction[];
  }) => {
    ReactGA.event({
      category: "Contract interaction",
      action: `Transactions pending action:${ga.action}`,
      label: `uniqueId:${ga.id} Tx hashes: ${ga.transactions
        .map((tx) => tx.hash)
        .join(" , ")}`
    });
  },
  transactionEnded: (ga: {
    action: string;
    id: string;
    hasFailure: boolean;
  }) => {
    ReactGA.event({
      category: "Contract interaction",
      action: `Transactions finished action:${ga.action}`,
      label: `uniqueId:${ga.id} Success: ${!ga.hasFailure}`
    });
  },
  transactionStart: (ga: { action: string; id: string; hash: string }) => {
    ReactGA.event({
      category: "Contract interaction",
      action: `Transaction pending action:${ga.action}`,
      label: `uniqueId:${ga.id} Tx hash: ${ga.hash}`
    });
  }
};
//TODO:eniko events
const mapTransactions = (
  setHash: (t: string | string[]) => string | false,
  ga: { action: string; id: string },
  transactions: ContractTransaction | ContractTransaction[] | null
) => {
  const { action, id } = ga;
  if (!transactions) {
    return {
      hasFailure: true,
      isLoading: false,
      status: TransactionStateEnum.FAILED,
      key: id,
      ga
    };
  } else if (Array.isArray(transactions)) {
    events.transactionsStart({ action, id, transactions });
    setHash(transactions.map((t) => t.hash));
    return {
      transactionHash: transactions.map((t) => t.hash),
      isLoading: true,
      status: TransactionStateEnum.PENDING,
      key: id,
      ga
    };
    // .pipe(
    //   map(([hasFailure, _]) => {
    //     return {
    //       hasFailure,
    //       transactionHash: transactions.map((t) => t.hash),
    //       isLoading: false,
    //       status: hasFailure
    //         ? TransactionStateEnum.FAILED
    //         : TransactionStateEnum.SUCCESS
    //     };
    //   })
    // )
    // .subscribe((value) => {
    //   subscriber.next(value);
    //   events.transactionEnded({
    //     action,
    //     id,
    //     hasFailure: value.hasFailure
    //   });
    //   subscriber.complete();
    // });
  } else {
    const tx = transactions;
    events.transactionStart({ action, id, hash: tx.hash });
    setHash(tx.hash);
    return {
      transactionHash: [tx.hash],
      isLoading: true,
      status: TransactionStateEnum.PENDING
    };
    // .pipe(
    //   map(([hasFailure, _]) => {
    //     return {
    //       hasFailure,
    //       transactionHash: [tx.hash],
    //       isLoading: false,
    //       status: hasFailure
    //         ? TransactionStateEnum.FAILED
    //         : TransactionStateEnum.SUCCESS
    //     };
    //   })
    // )
    // .subscribe((value) => {
    //   subscriber.next(value);
    //   events.transactionEnded({
    //     action,
    //     id,
    //     hasFailure: !value.hasFailure
    //   });
    //   subscriber.complete();
    // });
  }
};
export interface TransactionStatus {
  hasFailure?: boolean;
  transactionHash?: string[];
  status: TransactionStateEnum;
  isLoading: boolean;
}
export type TransactionId = string;
export type TransactionRequest = {
  promise: Promise<ContractTransaction[] | ContractTransaction>;
  transactionStatus: TransactionStatus;
  ga: { action: string; label: string };
};
export type TransactionRequests = {
  [id: TransactionId]: TransactionRequest;
};

type OptmisticTransactionState = {
  // start lend transactions
  // start rent transactions
  // claim transactions
  // return transactions
  // stop lend transactions
  // approve transactions
  transactionRequests: Record<string, TransactionRequest>;
  pendingTransactionRequests: string[];
  addTransactionRequest: (key: string, request: TransactionRequest) => void;
  updateTransactionRequest: (key: string, status: TransactionStatus) => void;
  removePendingTransaction: (keys: string) => void;
  addToPendingTransaction: (keys: string) => void;
};
const useOptimisticTransactionState = create<OptmisticTransactionState>(
  (set) => ({
    transactionRequests: {},
    pendingTransactionRequests: [],
    addTransactionRequest: (key: string, request: TransactionRequest) =>
      set(
        produce((state: OptmisticTransactionState) => {
          state.transactionRequests[key] = request;
        })
      ),
    updateTransactionRequest: (
      key: string,
      transactionStatus: TransactionStatus
    ) =>
      set(
        produce((state: OptmisticTransactionState) => {
          state.transactionRequests[key].transactionStatus.hasFailure =
            transactionStatus.hasFailure;
          state.transactionRequests[key].transactionStatus.isLoading =
            transactionStatus.isLoading;
          state.transactionRequests[key].transactionStatus.transactionHash =
            transactionStatus.transactionHash;
          state.transactionRequests[key].transactionStatus.status =
            transactionStatus.status;
        })
      ),
    removePendingTransaction: (key: string) =>
      set(
        produce((state: OptmisticTransactionState) => {
          state.pendingTransactionRequests =
            state.pendingTransactionRequests.filter((id: string) => id !== key);
        })
      ),
    addToPendingTransaction: (key: string) =>
      set(
        produce((state: OptmisticTransactionState) => {
          state.pendingTransactionRequests = Array.from(
            new Set([...state.pendingTransactionRequests, key])
          );
        })
      )
  })
);

export const useOptimisticTransaction = (): {
  createTransaction: (
    promise: Promise<ContractTransaction[] | ContractTransaction>,
    ga: { action: string; label: string }
  ) => TransactionId;
  transactionRequests: TransactionRequests;
  pendingTransactionRequests: string[];
} => {
  const { setHash, transactions } = useTransactions();
  const { setError } = useSnackProvider();
  // submitted request which we track and fire events on
  const pendingTransactionRequests = useOptimisticTransactionState(
    useCallback((state) => state.pendingTransactionRequests, []),
    shallow
  );
  const transactionRequests = useOptimisticTransactionState(
    useCallback((state) => state.transactionRequests, []),
    shallow
  );
  const addToPendingTransaction = useOptimisticTransactionState(
    useCallback((state) => state.addToPendingTransaction, [])
  );
  const removePendingTransaction = useOptimisticTransactionState(
    useCallback((state) => state.removePendingTransaction, [])
  );
  const updateTransactionRequest = useOptimisticTransactionState(
    useCallback((state) => state.updateTransactionRequest, [])
  );
  const addTransactionRequest = useOptimisticTransactionState(
    useCallback((state) => state.addTransactionRequest, [])
  );
  const createTransaction = useCallback(
    (
      promise: Promise<ContractTransaction[] | ContractTransaction>,
      ga
    ): string => {
      const { action, label } = ga;
      const id = Date.now().toString();
      events.askForSignature({ action, label, id });
      const transaction = {
        promise,
        ga: ga,
        transactionStatus: {
          status: TransactionStateEnum.PENDING,
          isLoading: true,
          key: id
        }
      };
      addTransactionRequest(id, transaction);
      // no need to cancel it
      promise
        .then((transactions) => {
          const transactionStatus = mapTransactions(
            setHash,
            { ...ga, id },
            transactions
          );
          updateTransactionRequest(id, transactionStatus);
          // Add to pending transactions
          addToPendingTransaction(id);
        })
        .catch((err) => {
          events.error({ ...ga, id, err });
          setError(err.message, "warning");
        });
      return id;
    },
    [addTransactionRequest, setHash, updateTransactionRequest, addToPendingTransaction, setError]
  );

  useEffect(() => {
    const subscription = timer(0, 10 * SECOND_IN_MILLISECONDS)
      .pipe(
        switchMap(() =>
          from(
            pendingTransactionRequests.map((key) => {
              const hashes =
                transactionRequests[key].transactionStatus.transactionHash;
              const hash = hashes ? hashes[0] : null;
              const transaction = hash ? transactions[hash] : null;
              if (transaction !== null) return { ...transaction, key };
              return null;
            })
          )
        ),
        map((transactionState: (TransactionState & { key: string }) | null) => {
          if (transactionState) {
            console.log("update request", transactionState);
            if (transactionState.hasFailure) {
              removePendingTransaction(transactionState.key);
              updateTransactionRequest(transactionState.key, {
                status: TransactionStateEnum.FAILED,
                hasFailure: true,
                isLoading: false
              });
            }
            if (!transactionState.hasPending) {
              removePendingTransaction(transactionState.key);
              updateTransactionRequest(transactionState.key, {
                status: TransactionStateEnum.SUCCESS,
                hasFailure: false,
                isLoading: false
              });
            }
            // if it still pending leave it there
          }
        })
      )
      .subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [
    pendingTransactionRequests,
    transactionRequests,
    transactions,
    removePendingTransaction,
    updateTransactionRequest
  ]);

  return { createTransaction, transactionRequests, pendingTransactionRequests };
};

// update status to form or where the request started
export const useCreateRequest = (): {
  status: TransactionStatus;
  createRequest: (
    promise: Promise<ContractTransaction[] | ContractTransaction>,
    ga: { action: string; label: string }
  ) => void;
} => {
  const { createTransaction, transactionRequests, pendingTransactionRequests } =
    useOptimisticTransaction();
  const [requestId, setRequestId] = useState<string>();

  const createRequest = useCallback(
    (promise: Promise<ContractTransaction[] | ContractTransaction>, ga) => {
      const id = createTransaction(promise, ga);
      setRequestId(id);
    },
    [createTransaction]
  );

  const status = useMemo(() => {
    if (pendingTransactionRequests.length === 0)
      return {
        isLoading: true,
        hasFailure: false,
        status: TransactionStateEnum.WAITING_FOR_SIGNATURE
      };

    const request = requestId ? transactionRequests[requestId] : null;
    return (
      request?.transactionStatus || {
        isLoading: true,
        hasFailure: false,
        status: TransactionStateEnum.WAITING_FOR_SIGNATURE
      }
    );
  }, [pendingTransactionRequests, requestId, transactionRequests]);
  return { createRequest, status };
};
