import { useCallback } from "react";
import { BigNumber } from "ethers";
import createDebugger from "debug";
import { useSDK } from "./useSDK";
import {
  TransactionStatus,
  useTransactionWrapper,
} from "../useTransactionWrapper";
import { EMPTY, Observable } from "rxjs";
import { sortNfts } from "../../utils";
import { LendInputDefined } from "../../components/forms/lend/lend-types";

const debug = createDebugger("app:contract");

export const useStartLend = (): ((
  lendingInputs: LendInputDefined[]
) => Observable<TransactionStatus>) => {
  const sdk = useSDK();
  const transactionWrapper = useTransactionWrapper();

  const startLend = useCallback(
    (lendingInputs: LendInputDefined[]) => {
      if (!sdk) return EMPTY;

      const amounts: number[] = [];
      const maxRentDurations: number[] = [];
      const dailyRentPrices: number[] = [];
      const nftPrice: number[] = [];
      const addresses: string[] = [];
      const tokenIds: BigNumber[] = [];
      const pmtTokens: number[] = [];

      const sortedNfts = Object.values(lendingInputs)
        .map((a) => ({ ...a.nft, ...a }))
        .sort(sortNfts);
      sortedNfts.forEach((item) => {
        amounts.push(item.lendAmount);
        maxRentDurations.push(item.maxDuration);
        dailyRentPrices.push(item.borrowPrice);
        nftPrice.push(item.nftPrice);
        pmtTokens.push(item.pmToken);
      });
      sortedNfts.forEach(({ address, tokenId }) => {
        addresses.push(address);
        tokenIds.push(BigNumber.from(tokenId));
      });
      debug("addresses", addresses);
      debug("tokenIds", tokenIds);
      debug("amounts", amounts);
      debug("maxRentDurations", maxRentDurations);
      debug("dailyRentPrices", dailyRentPrices);
      debug("nftPrice", nftPrice);
      debug("tokens", pmtTokens);

      return transactionWrapper(
        sdk.lend(
          addresses,
          tokenIds,
          amounts,
          maxRentDurations,
          dailyRentPrices,
          nftPrice,
          pmtTokens
        ),
        {
          action: "lend",
          label: `
        addresses: ${addresses}
        tokenIds: ${tokenIds}
        amounts: ${amounts}
        maxRentDurations: ${maxRentDurations}
        dailyRentPrices: ${dailyRentPrices}
        nftPrice: ${nftPrice}
        tokens: ${pmtTokens}
        `,
        }
      );
    },
    [sdk, transactionWrapper]
  );
  return startLend;
};
