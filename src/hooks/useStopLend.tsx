import { useCallback } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { useSDK } from "./useSDK";
import { TransactionStatus, useTransactionWrapper } from "./useTransactionWrapper";
import { EMPTY, Observable } from "rxjs";


export const useStopLend = (): ((
  nfts: {
    address: string;
    tokenId: string;
    lendingId: string;
  }[]
) => Observable<TransactionStatus>) => {
  const transactionWrapper = useTransactionWrapper();

  const sdk = useSDK();

  return useCallback(
    (
      nfts: {
        address: string;
        tokenId: string;
        lendingId: string;
      }[]
    ) => {
      if (!sdk) return EMPTY;
      const arr: [string[], BigNumber[], BigNumber[]] = [
        nfts.map((nft) => nft.address),
        nfts.map((nft) => BigNumber.from(nft.tokenId)),
        nfts.map((nft) => BigNumber.from(nft.lendingId))
      ];
      return transactionWrapper(sdk.stopLending(...arr), {
        action: 'return nft', 
        label: `
          addresses: ${nfts.map((nft) => nft.address)}
          tokenId: ${nfts.map((nft) => BigNumber.from(nft.tokenId))}
          lendingId: ${nfts.map((nft) => BigNumber.from(nft.lendingId))}
        `
      });
    },
    [sdk]
  );
};
