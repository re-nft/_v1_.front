import { useCallback } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { useSDK } from "./useSDK";
import {
  TransactionStatus,
  useTransactionWrapper,
} from "../misc/useTransactionWrapper";
import { EMPTY, Observable } from "rxjs";
import { Lending, Nft } from "../../types/classes";


export const useStopLend = (): ((
  nfts: Lending[]
) => Observable<TransactionStatus>) => {
  const transactionWrapper = useTransactionWrapper();

  const sdk = useSDK();

  return useCallback(
    (
      lendings: Lending[]
    ) => {
      if (!sdk) return EMPTY;
      const arr: [string[], BigNumber[], BigNumber[]] = [
        lendings.map((lending) => lending.nftAddress),
        lendings.map((lending) => BigNumber.from(lending.tokenId)),
        lendings.map((lending) => BigNumber.from(lending.id)),
      ];
      return transactionWrapper(sdk.stopLending(...arr), {
        action: "return nft",
        label: `
          addresses: ${lendings.map((lending) => lending.nftAddress)}
          tokenId: ${lendings.map((lending) => BigNumber.from(lending.tokenId))}
          lendingId: ${lendings.map((lending) => BigNumber.from(lending.id))}
        `,
      });
    },
    [sdk, transactionWrapper]
  );
};
