import { ContractTransaction } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { TransactionState, useTransactions } from "../store/useTransactions";
import { from, map, switchMap, timer } from "rxjs";
import { TransactionStateEnum } from "../../types";
import ReactGA from "react-ga";
import { useSnackProvider } from "../store/useSnackProvider";
import { SECOND_IN_MILLISECONDS } from "../../consts";

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
  { action, id }: { action: string; id: string },
  transactions: ContractTransaction | ContractTransaction[] | null
) => {
  if (!transactions) {
    return {
      hasFailure: true,
      isLoading: false,
      status: TransactionStateEnum.FAILED
    };
  } else if (Array.isArray(transactions)) {
    events.transactionsStart({ action, id, transactions });
    setHash(transactions.map((t) => t.hash));
    return {
      transactionHash: transactions.map((t) => t.hash),
      isLoading: true,
      status: TransactionStateEnum.PENDING
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
  const [transactionRequests, setTransactionRequests] =
    useState<TransactionRequests>({});
  // submitted request which we track and fire events on
  const [pendingTransactionRequests, setPendingTransactionRequest] = useState<
    string[]
  >([]);
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
          isLoading: true
        }
      };
      setTransactionRequests((prev) => ({
        ...prev,
        [id]: transaction
      }));
      promise
        .then((transactions) => {
          const transactionStatus = mapTransactions(
            setHash,
            { ...ga, id },
            transactions
          );

          setTransactionRequests((prev) => {
            prev[id].transactionStatus.hasFailure =
              transactionStatus.hasFailure;
            prev[id].transactionStatus.isLoading = transactionStatus.isLoading;
            prev[id].transactionStatus.status = transactionStatus.status;
            prev[id].transactionStatus.transactionHash =
              transactionStatus.transactionHash;
            return prev;
          });
          // Add to pending transactions
          setPendingTransactionRequest((arr) => {
            return [...arr, id];
          });
        })
        .catch((err) => {
          events.error({ ...ga, id, err });
          setError(err.message, "warning");
        });
      return id;
    },
    [setHash, setError]
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
          console.log(transactionState)
          if (transactionState) {
            if (transactionState.hasFailure) {
              // remove from transactionRequests
              setPendingTransactionRequest((arr) => {
                const index = arr.indexOf(transactionState.key);
                return [...arr.slice(index, 1)];
              });
              setTransactionRequests((prev) => {
                prev[transactionState.key].transactionStatus.status =
                  TransactionStateEnum.FAILED;
                prev[transactionState.key].transactionStatus.hasFailure = true;
                prev[transactionState.key].transactionStatus.isLoading = false;
                return prev;
              });
            }
            if (!transactionState.hasPending) {
              // remove from transactionRequests
              setPendingTransactionRequest((arr) => {
                const index = arr.indexOf(transactionState.key);
                return [...arr.slice(index, 1)];
              });
              setTransactionRequests((prev) => {
                prev[transactionState.key].transactionStatus.status =
                  TransactionStateEnum.SUCCESS;
                prev[transactionState.key].transactionStatus.hasFailure = false;
                prev[transactionState.key].transactionStatus.isLoading = false;
                return prev;
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
  }, [pendingTransactionRequests, transactionRequests, transactions]);

  return { createTransaction, transactionRequests, pendingTransactionRequests };
};
