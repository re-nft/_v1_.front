import { ContractTransaction } from "ethers";
import { useCallback, useContext } from "react";
import TransactionStateContext from "../contexts/TransactionState";
import { from, Observable, of } from "rxjs";
import { map, mergeAll } from "rxjs/operators";
import { TransactionStateEnum } from "../types";
import { SnackAlertContext } from "../contexts/SnackProvider";
import ReactGA from "react-ga";
import { nanoid } from 'nanoid'
import * as Sentry from "@sentry/nextjs";

export interface TransactionStatus {
  hasFailure?: boolean;
  transactionHash?: string[];
  status: TransactionStateEnum;
  isLoading: boolean;
}

const mapTransactions =
  (setHash: (t: string | string[]) => Observable<[boolean, boolean]>, {action, id}: {action: string, id: string}) =>
  (transactions: ContractTransaction | ContractTransaction[] | null) =>
    new Observable<TransactionStatus>((subscriber) => {
      if (!transactions) {
        subscriber.next({
          hasFailure: true,
          isLoading: false,
          status: TransactionStateEnum.FAILED
        });
     
        subscriber.complete();
      } else if (Array.isArray(transactions)) {
        ReactGA.event({
          category: "Contract interaction",
          action: `Transactions pending action:${action}`,
          label: `uniqueId:${id} Tx hashes: ${transactions.map(tx => tx.hash).join(' , ')}`
        });
        subscriber.next({
          transactionHash: transactions.map((t) => t.hash),
          isLoading: true,
          status: TransactionStateEnum.PENDING
        });
        setHash(transactions.map((t) => t.hash))
          .pipe(
            map(([hasFailure, _]) => {
              return {
                hasFailure,
                transactionHash: transactions.map((t) => t.hash),
                isLoading: false,
                status: hasFailure
                  ? TransactionStateEnum.FAILED
                  : TransactionStateEnum.SUCCESS
              };
            })
          )
          .subscribe((value) => {
            subscriber.next(value);
            ReactGA.event({
              category: "Contract interaction",
              action: `Transactions finished action:${action}`,
              label: `uniqueId:${id} Success: ${!value.hasFailure}`
            });
            subscriber.complete();
          });
      } else {
        const tx = transactions;
        ReactGA.event({
          category: "Contract interaction",
          action: `Transaction pending action:${action}`,
          label: `uniqueId:${id} Tx hash: ${tx.hash}`
        });
        subscriber.next({
          transactionHash: [tx.hash],
          isLoading: true,
          status: TransactionStateEnum.PENDING
        });
        setHash(tx.hash)
          .pipe(
            map(([hasFailure, _]) => {
              return {
                hasFailure,
                transactionHash: [tx.hash],
                isLoading: false,
                status: hasFailure
                  ? TransactionStateEnum.FAILED
                  : TransactionStateEnum.SUCCESS
              };
            })
          )
          .subscribe((value) => {
            subscriber.next(value);
            ReactGA.event({
              category: "Contract interaction",
              action: `Transactions finished action:${action}`,
              label: `uniqueId:${id} Success: ${!value.hasFailure}`
            });
            subscriber.complete();
          });
      }
    });

export const useTransactionWrapper = (): ((
  promise: Promise<ContractTransaction[] | ContractTransaction>,
  ga: {
    action: string,
  label: string
}
) => Observable<TransactionStatus>) => {
  const { setHash } = useContext(TransactionStateContext);
  const { setError } = useContext(SnackAlertContext);

  return useCallback(
    (
      promise: Promise<ContractTransaction[] | ContractTransaction>,
      ga
    ) => {
      const {action, label} = ga;
      const id = nanoid();
      ReactGA.event({
        category: "Contract interaction",
        action: `Start action:${action}`,
        label : `uniqueId:${id} ${label}`,
      });
      return from([
        //emit initial state
        of({
          status: TransactionStateEnum.PENDING,
          isLoading: true
        }),
        from(
          promise.catch((err) => {
            const event = {
              category: "Contract interaction",
              action: `Error action:${action}`,
              label: `uniqueId:${id} ${err.message}`,};
            Sentry.captureMessage(`Error action: ${action} ${err.message}`)
            setError(err.message, "warning");
            return null;
          })
        ).pipe(map(mapTransactions(setHash, {action, id})), mergeAll())
      ]).pipe(mergeAll());
    },
    [setError, setHash]
  );
};
