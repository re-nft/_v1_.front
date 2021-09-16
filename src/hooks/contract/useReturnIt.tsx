import { BigNumber } from "ethers";
import { useCallback } from "react";
import { EMPTY, Observable } from "rxjs";
import { Renting } from "../../types/classes";
import { sortNfts } from "../../utils";
import { useSDK } from "./useSDK";
import {
  TransactionStatus,
  useTransactionWrapper,
} from "../useTransactionWrapper";

export const useReturnIt = (): ((
  rentings: Renting[]
) => Observable<TransactionStatus>) => {
  const sdk = useSDK();
  const transactionWrapper = useTransactionWrapper();

  return useCallback(
    (rentings: Renting[]) => {
      if (!sdk) return EMPTY;
      if (rentings.length < 1) return EMPTY;
      const sortedNfts = rentings.sort(sortNfts);
      return transactionWrapper(
        sdk.returnIt(
          sortedNfts.map((renting) => renting.nftAddress),
          sortedNfts.map((renting) => BigNumber.from(renting.tokenId)),
          sortedNfts.map((renting) => BigNumber.from(renting.lendingId))
        ),
        {
          action: "Return nft",
          label: `
          addresses: ${sortedNfts.map((renting) => renting.nftAddress)}
          tokenIds: ${sortedNfts.map((renting) => BigNumber.from(renting.tokenId))}
          lendingIds: ${sortedNfts.map((renting) =>
            BigNumber.from(renting.lendingId)
          )}
        `,
        }
      );
    },
    [sdk, transactionWrapper]
  );
};
