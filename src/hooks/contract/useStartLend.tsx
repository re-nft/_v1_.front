import { useCallback } from "react";
import { BigNumber } from "ethers";
import createDebugger from "debug";
import { useSDK } from "./useSDK";
import {
  TransactionStatus,
  useTransactionWrapper,
} from "../useTransactionWrapper";
import { EMPTY, Observable } from "rxjs";
import { LendInputDefined } from "../../forms/lend-form";
import { sortNfts } from "../../utils";
//@ts-ignore
import { NFTStandard } from "@eenagy/sdk";

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
      const addresses: string[] = [];
      const tokenIds: BigNumber[] = [];
      const pmtTokens: number[] = [];
      const standards: NFTStandard[] = [];

      const sortedNfts = Object.values(lendingInputs)
        .map((a) => ({ ...a.nft, ...a }))
        .sort(sortNfts);
      sortedNfts.forEach((item) => {
        standards.push(item.isERC721 ? NFTStandard.E721 : NFTStandard.E1155);
        amounts.push(item.lendAmount);
        maxRentDurations.push(item.maxDuration);
        dailyRentPrices.push(item.borrowPrice);
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
      debug("tokens", pmtTokens);

      return transactionWrapper(
        sdk.lend(
          standards,
          addresses,
          tokenIds,
          amounts,
          maxRentDurations,
          dailyRentPrices,
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
        tokens: ${pmtTokens}
        `,
        }
      );
    },
    [sdk]
  );
  return startLend;
};
