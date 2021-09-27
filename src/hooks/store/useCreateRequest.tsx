import { ContractTransaction } from "ethers";
import { useCallback, useMemo, useState } from "react";
import { TransactionStateEnum } from "../../types";
import {
  SmartContractEventType,
  TransactionRequest,
  TransactionStatus,
  useEventTrackedTransactionManager
} from "../store/useEventTrackedTransactions";

// update status to form or where the request started
export const useCreateRequest = (): {
  status: TransactionStatus;
  createRequest: (
    promise: Promise<ContractTransaction[] | ContractTransaction>,
    ga: { action: string; label: string },
    event: {
      ids: string[];
      type: SmartContractEventType;
    }
  ) => void;
} => {
  const { createTransaction, transactionRequests } =
    useEventTrackedTransactionManager();
  const [requestId, setRequestId] = useState<string>();

  const createRequest = useCallback(
    (
      promise: Promise<ContractTransaction[] | ContractTransaction>,
      ga,
      event
    ) => {
      const id = createTransaction(promise, ga, event);
      setRequestId(id);
    },
    [createTransaction]
  );

  const status = useMemo(() => {
    const request: TransactionRequest | null = requestId
      ? transactionRequests[requestId]
      : null;
    if (request === null || request === undefined) {
      return {
        isLoading: false,
        hasFailure: false,
        status: TransactionStateEnum.NOT_STARTED
      };
    }

    return request.transactionStatus;
  }, [requestId, transactionRequests]);
  return { createRequest, status };
};
