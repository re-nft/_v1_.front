import { useEffect, useState } from "react";
import { EMPTY, Observable, Subscription } from "rxjs";
import { TransactionStateEnum } from "../types";
import { TransactionStatus } from "./useTransactionWrapper";

export const useObservable = (): [
  TransactionStatus,
  (observable: Observable<TransactionStatus>) => void
] => {
  const [value, setValue] = useState<TransactionStatus>({
    hasFailure: false,
    status: TransactionStateEnum.PENDING,
    isLoading: false
  });
  const [observable, setObservable] =
    useState<Observable<TransactionStatus>>(EMPTY);

  useEffect(() => {
    let subscription: Subscription | null = null;
    if (!observable) return;
    subscription = observable.subscribe((v: TransactionStatus) => {
      setValue(v);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [observable]);

  return [value, setObservable];
};
