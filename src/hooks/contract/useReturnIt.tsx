import { BigNumber } from "ethers";
import { useCallback, useMemo, useState } from "react";
import { Renting } from "../../types/classes";
import { sortNfts } from "../../utils";
import { useSDK } from "./useSDK";
import {
  TransactionStatus,
  useOptimisticTransaction
} from "../misc/useOptimisticTransaction";
import { TransactionStateEnum } from "../../types";

export const useReturnIt = (): {
  returnIt: (rentings: Renting[]) => void;
  status: TransactionStatus;
} => {
  const sdk = useSDK();
  const { createTransaction, transactionRequests } = useOptimisticTransaction();
  const [requestId, setRequestId] = useState<string>();

  const returnIt = useCallback(
    (rentings: Renting[]) => {
      if (!sdk) return false;
      if (rentings.length < 1) return false;
      const sortedNfts = rentings.sort(sortNfts);
      const id = createTransaction(
        sdk.returnIt(
          sortedNfts.map((renting) => renting.nftAddress),
          sortedNfts.map((renting) => BigNumber.from(renting.tokenId)),
          sortedNfts.map((renting) => BigNumber.from(renting.lendingId))
        ),
        {
          action: "Return nft",
          label: `
          addresses: ${sortedNfts.map((renting) => renting.nftAddress)}
          tokenIds: ${sortedNfts.map((renting) =>
            BigNumber.from(renting.tokenId)
          )}
          lendingIds: ${sortedNfts.map((renting) =>
            BigNumber.from(renting.lendingId)
          )}
        `
        }
      );
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
  return { returnIt, status };
};
