import { useCallback } from "react";
import { PaymentToken } from "@renft/sdk";
import { BigNumber } from "ethers";
import createDebugger from "debug";
import { useSDK } from "./useSDK";
import { TransactionStatus, useTransactionWrapper } from "./useTransactionWrapper";
import { EMPTY, Observable } from "rxjs";

// ENABLE with DEBUG=* or DEBUG=FETCH,Whatever,ThirdOption
const debug = createDebugger("app:contract");
//const debug = console.log;

export const useStartLend = (): ((
  addresses: string[],
  tokenIds: BigNumber[],
  lendAmounts: number[],
  maxRentDurations: number[],
  dailyRentPrices: number[],
  nftPrice: number[],
  tokens: PaymentToken[]
) => Observable<TransactionStatus>) => {
  const sdk = useSDK();
  const transactionWrapper = useTransactionWrapper();

  const startLend = useCallback(
    (
      addresses: string[],
      tokenIds: BigNumber[],
      amounts: number[],
      maxRentDurations: number[],
      dailyRentPrices: number[],
      nftPrice: number[],
      tokens: PaymentToken[]
    ) => {
      if (!sdk) return EMPTY;

      debug("addresses", addresses);
      debug("tokenIds", tokenIds);
      debug("amounts", amounts);
      debug("maxRentDurations", maxRentDurations);
      debug("dailyRentPrices", dailyRentPrices);
      debug("nftPrice", nftPrice);
      debug("tokens", tokens);

      return transactionWrapper(
        sdk.lend(
          addresses,
          tokenIds,
          amounts,
          maxRentDurations,
          dailyRentPrices,
          nftPrice,
          tokens
        )
      );
    },
    [sdk]
  );
  return startLend;
};
