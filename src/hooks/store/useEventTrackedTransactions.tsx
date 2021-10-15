import { ContractTransaction } from "@ethersproject/contracts";
import { useCallback, useEffect } from "react";
import { from, map, switchMap, timer } from "rxjs";
import ReactGA from "react-ga";

import { TransactionStateEnum } from "renft-front/types";
import { useSnackProvider } from "renft-front/hooks/store/useSnackProvider";
import { SECOND_IN_MILLISECONDS } from "renft-front/consts";
import { TransactionState, useTransactions } from "renft-front/hooks/store/useTransactions";
import { useCurrentAddress } from "renft-front/hooks/misc/useCurrentAddress";
import { usePrevious } from "renft-front/hooks/misc/usePrevious";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
const mapTransactions = (
  setHash: (t: string | string[]) => string | false,
  ga: { action: string; id: string },
  transactions: ContractTransaction | ContractTransaction[] | null
) => {
  const { action, id } = ga;
  if (!transactions) {
    // user denied transaction signature
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
      hasFailure: false,
      status: TransactionStateEnum.PENDING,
      key: id,
      ga
    };
  } else {
    const tx = transactions;
    events.transactionStart({ action, id, hash: tx.hash });
    setHash(tx.hash);
    return {
      transactionHash: [tx.hash],
      isLoading: true,
      hasFailure: false,
      status: TransactionStateEnum.PENDING
    };
  }
};
export interface TransactionStatus {
  hasFailure: boolean;
  transactionHash?: string[];
  status: TransactionStateEnum;
  isLoading: boolean;
}
export type TransactionRequest = {
  event: { ids: string[]; type: SmartContractEventType };
  transactionStatus: TransactionStatus;
  ga: { action: string; label: string };
};
export type TransactionRequests = {
  [id: string]: TransactionRequest;
};
export enum SmartContractEventType {
  START_LEND = 1,
  START_RENT,
  RETURN_RENTAL,
  STOP_LEND,
  CLAIM,
  APPROVE_PAYMENT_TOKEN,
  APPROVE_NFT
}

export type EventTrackedTransactionStateManager = {
  pendingTransactions: Record<SmartContractEventType, string[]>;
  transactionRequests: Record<string, TransactionRequest>;
  // for checking and updating state and fire GA
  pendingTransactionRequests: string[];
  // for tracking Lending/renting/nft state changes for UI
  uiPendingTransactionState: {
    [uniqueId: string]: TransactionStateEnum | null;
  };
  addTransactionRequest: (key: string, request: TransactionRequest) => void;
  updateTransactionRequest: (key: string, status: TransactionStatus) => void;
  removePendingTransaction: (keys: string) => void;
  addToPendingTransaction: (keys: string) => void;
  resetState: () => void;
};

const getDefaultState = () => {
  return {
    // additional layer to track user inititated, but waiting for signature
    transactionRequests: {},
    //these are the submitted transactions to blockchain
    pendingTransactionRequests: [],
    // use Record structure for pending transaction
    uiPendingTransactionState: {},
    pendingTransactions: {
      [SmartContractEventType.APPROVE_NFT]: [],
      [SmartContractEventType.APPROVE_PAYMENT_TOKEN]: [],
      [SmartContractEventType.CLAIM]: [],
      [SmartContractEventType.RETURN_RENTAL]: [],
      [SmartContractEventType.START_LEND]: [],
      [SmartContractEventType.START_RENT]: [],
      [SmartContractEventType.STOP_LEND]: []
    },

  }
}
export const useEventTrackedTransactionState =
  create<EventTrackedTransactionStateManager>((set) => ({
    ...getDefaultState(),
    addTransactionRequest: (key: string, request: TransactionRequest) =>
      set(
        produce((draft: EventTrackedTransactionStateManager) => {
          draft.transactionRequests[key] = request;
          draft.pendingTransactions[request.event.type] = Array.from(
            new Set([
              ...request.event.ids,
              ...draft.pendingTransactions[request.event.type]
            ])
          );
          request.event.ids.forEach((id) => {
            draft.uiPendingTransactionState[id] =
              TransactionStateEnum.WAITING_FOR_SIGNATURE;
          });
        })
      ),
    updateTransactionRequest: (
      key: string,
      transactionStatus: TransactionStatus
    ) =>
      set(
        produce((draft: EventTrackedTransactionStateManager) => {
          draft.transactionRequests[key].transactionStatus.hasFailure =
            !!transactionStatus.hasFailure;
          draft.transactionRequests[key].transactionStatus.isLoading =
            transactionStatus.isLoading;
          draft.transactionRequests[key].transactionStatus.transactionHash =
            transactionStatus.transactionHash;
          draft.transactionRequests[key].transactionStatus.status =
            transactionStatus.status;
          const request = draft.transactionRequests[key];
          request.event.ids.forEach((id) => {
            draft.uiPendingTransactionState[id] = transactionStatus.status;
          });
        })
      ),
    removePendingTransaction: (key: string) =>
      set(
        produce((draft: EventTrackedTransactionStateManager) => {
          const event = draft.transactionRequests[key].event;
          const set = new Set(event.ids);
          draft.pendingTransactions[event.type] = draft.pendingTransactions[
            event.type
          ].filter((i) => !set.has(i));
          draft.pendingTransactionRequests =
            draft.pendingTransactionRequests.filter((id: string) => id !== key);
          event.ids.forEach((id) => {
            draft.uiPendingTransactionState[id] = null;
          });
        })
      ),
    addToPendingTransaction: (key: string) =>
      set(
        produce((draft: EventTrackedTransactionStateManager) => {
          draft.pendingTransactionRequests = Array.from(
            new Set([...draft.pendingTransactionRequests, key])
          );
          const request = draft.transactionRequests[key];
          request.event.ids.forEach((id) => {
            draft.uiPendingTransactionState[id] = TransactionStateEnum.PENDING;
          });
        })
      ),
    resetState: () =>
      set(
        produce((_draft: EventTrackedTransactionStateManager) => {
          return { ...getDefaultState() }
        })
      )
  }));

export const useEventTrackedTransactionManager = (): {
  createTransaction: (
    promise: () => Promise<ContractTransaction[] | ContractTransaction>,
    ga: { action: string; label: string },
    event: {
      ids: string[];
      type: SmartContractEventType;
    }
  ) => string;
  transactionRequests: TransactionRequests;
  pendingTransactionRequests: string[];
} => {
  const { setHash, transactions } = useTransactions();
  const { setError } = useSnackProvider();
  const currentAddress = useCurrentAddress();
  const previousAddress = usePrevious(currentAddress);
  // submitted request which we track and fire events on
  const pendingTransactionRequests = useEventTrackedTransactionState(
    useCallback((state) => state.pendingTransactionRequests, []),
    shallow
  );
  const transactionRequests = useEventTrackedTransactionState(
    useCallback((state) => state.transactionRequests, []),
    shallow
  );
  const addToPendingTransaction = useEventTrackedTransactionState(
    useCallback((state) => state.addToPendingTransaction, [])
  );
  const removePendingTransaction = useEventTrackedTransactionState(
    useCallback((state) => state.removePendingTransaction, [])
  );
  const updateTransactionRequest = useEventTrackedTransactionState(
    useCallback((state) => state.updateTransactionRequest, [])
  );
  const addTransactionRequest = useEventTrackedTransactionState(
    useCallback((state) => state.addTransactionRequest, [])
  );
  const resetState = useEventTrackedTransactionState(
    useCallback((state) => state.resetState, [])
  );
  const createTransaction = useCallback(
    (
      promise: () => Promise<ContractTransaction[] | ContractTransaction>,
      ga,
      event
    ): string => {
      const { action, label } = ga;
      const id = Date.now().toString();
      events.askForSignature({ action, label, id });
      const transaction = {
        ga: ga,
        event,
        transactionStatus: {
          status: TransactionStateEnum.PENDING,
          hasFailure: false,
          isLoading: true,
          key: id
        }
      };
      addTransactionRequest(id, transaction);
      // no need to cancel it
      promise()
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
          updateTransactionRequest(id, {
            hasFailure: true,
            isLoading: false,
            status: TransactionStateEnum.DENIED_SIGNATURE
          });

          setError(err.message, "warning");
        });
      return id;
    },
    [
      addTransactionRequest,
      setHash,
      updateTransactionRequest,
      addToPendingTransaction,
      setError
    ]
  );

  useEffect(() => {
    const subscription = timer(0, 2 * SECOND_IN_MILLISECONDS)
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
            if (transactionState.hasFailure) {
              removePendingTransaction(transactionState.key);
              updateTransactionRequest(transactionState.key, {
                status: TransactionStateEnum.FAILED,
                hasFailure: true,
                isLoading: false,
                transactionHash: transactionState.hashes
              });
              events.transactionEnded({
                id: transactionState.key,
                //TODO:eniko action
                action: "",
                hasFailure: true
              });
            }
            else if (!transactionState.hasPending) {
              removePendingTransaction(transactionState.key);
              events.transactionEnded({
                id: transactionState.key,
                //TODO:eniko action
                action: "",
                hasFailure: false
              });
              updateTransactionRequest(transactionState.key, {
                status: TransactionStateEnum.SUCCESS,
                hasFailure: false,
                isLoading: false,
                transactionHash: transactionState.hashes
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

  useEffect(() => {
    if (previousAddress != "" && currentAddress !== previousAddress) {
      resetState();
    }
  }, [currentAddress, previousAddress, resetState]);

  return { createTransaction, transactionRequests, pendingTransactionRequests };
};