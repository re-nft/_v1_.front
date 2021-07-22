import { BigNumber } from "ethers";
import { useCallback } from "react";
import { EMPTY, Observable } from "rxjs";
import { Renting } from "../contexts/graph/classes";
import { sortNfts } from "../utils";
import { useSDK } from "./useSDK";
import { TransactionStatus, useTransactionWrapper } from "./useTransactionWrapper";

export const useReturnIt = (): ((nfts: Renting[]) => Observable<TransactionStatus>) => {
  const sdk = useSDK();
  const transactionWrapper = useTransactionWrapper();

  return useCallback(
    (nfts: Renting[]) => {
      if (!sdk) return EMPTY;
      if (nfts.length < 1) return EMPTY;
      const sortedNfts = nfts.sort(sortNfts);
      return transactionWrapper(
        sdk.returnIt(
          sortedNfts.map((nft) => nft.address),
          sortedNfts.map((nft) => BigNumber.from(nft.tokenId)),
          sortedNfts.map((nft) => BigNumber.from(nft.renting.lendingId))
        )
      );
    },
    [sdk]
  );
};
