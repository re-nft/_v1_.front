import { useCallback } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import createDebugger from "debug";
import { useSDK } from "./useSDK";
import { useTransactionWrapper } from "./useTransactionWrapper";

const debug = createDebugger("app:contracts:usestoplend");

export const useStopLend = (): ((
  nfts: {
    address: string;
    tokenId: string;
    lendingId: string;
  }[]
) => Promise<void | boolean>) => {
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
      if (!sdk) return Promise.resolve();
      const arr: [string[], BigNumber[], BigNumber[]] = [
        nfts.map((nft) => nft.address),
        nfts.map((nft) => BigNumber.from(nft.tokenId)),
        nfts.map((nft) => BigNumber.from(nft.lendingId))
      ];
      return transactionWrapper(sdk.stopLending(...arr));
    },
    [sdk]
  );
};
