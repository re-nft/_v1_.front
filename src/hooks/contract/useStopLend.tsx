import { useCallback, useMemo, useState } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { useSDK } from "./useSDK";
import {
  TransactionStatus,
  useOptimisticTransaction
} from "../misc/useOptimisticTransaction";
import { Lending } from "../../types/classes";
import { TransactionStateEnum } from "../../types";

export const useStopLend = (): {
  stopLend: (lendings: Lending[]) => void;
  status: TransactionStatus;
} => {
  const { createTransaction, transactionRequests } = useOptimisticTransaction();
  const [requestId, setRequestId] = useState<string>();

  const sdk = useSDK();

  const stopLend = useCallback(
    (lendings: Lending[]) => {
      if (!sdk) return false;
      const arr: [string[], BigNumber[], BigNumber[]] = [
        lendings.map((lending) => lending.nftAddress),
        lendings.map((lending) => BigNumber.from(lending.tokenId)),
        lendings.map((lending) => BigNumber.from(lending.id))
      ];
      const id = createTransaction(sdk.stopLending(...arr), {
        action: "return nft",
        label: `
          addresses: ${lendings.map((lending) => lending.nftAddress)}
          tokenId: ${lendings.map((lending) => BigNumber.from(lending.tokenId))}
          lendingId: ${lendings.map((lending) => BigNumber.from(lending.id))}
        `
      });
      setRequestId(id);
    },
    [sdk, createTransaction]
  );

  const status = useMemo(() => {
    return requestId
      ? transactionRequests[requestId].transactionStatus
      : {
          isLoading: true,
          hasFailure: false,
          status: TransactionStateEnum.WAITING_FOR_SIGNATURE
        };
  }, [transactionRequests, requestId]);
  return { stopLend, status };
};
