import { ContractTransaction } from "ethers";
import { useCallback, useContext } from "react";
import TransactionStateContext from "../contexts/TransactionState";
import { from, Observable, of } from "rxjs";
import { map, mergeAll } from "rxjs/operators";
import { TransactionStateEnum } from "../types";
import { SnackAlertContext } from "../contexts/SnackProvider";

export interface TransactionStatus {
  hasFailure?: boolean;
  transactionHash?: string[];
  status: TransactionStateEnum;
  isLoading: boolean;
}

const mapTransactions =
  (setHash: (t: string | string[]) => Observable<[boolean, boolean]>) =>
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
            subscriber.complete();
          });
      } else {
        const tx = transactions;
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
            subscriber.complete();
          });
      }
    });

export const useTransactionWrapper = (): ((
  promise: Promise<ContractTransaction[] | ContractTransaction>
) => Observable<TransactionStatus>) => {
  const { setHash } = useContext(TransactionStateContext);
  const { setError } = useContext(SnackAlertContext);

  return useCallback(
    (promise: Promise<ContractTransaction[] | ContractTransaction>) => {
      return from([
        //emit initial state
        of({
          status: TransactionStateEnum.PENDING,
          isLoading: true
        }),
        from(
          promise.catch((err) => {
            //dodo
            setError(err.message, "warning");
            return null;
          })
        ).pipe(
          map(mapTransactions(setHash)),
          mergeAll()
        )
      ]).pipe(mergeAll());
    },
    [setHash]
  );
};
