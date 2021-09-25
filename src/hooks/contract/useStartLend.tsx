import { useCallback } from "react";
import { BigNumber } from "ethers";
import createDebugger from "debug";
import { useSDK } from "./useSDK";
import {
  SmartContractEventType,
  TransactionStatus
} from "../misc/useEventTrackedTransactions";
import { sortNfts } from "../../utils";
import { LendInputDefined } from "../../components/forms/lend/lend-types";
import {  useCreateRequest } from "../misc/useCreateRequest";

const debug = createDebugger("app:contract");

export const useStartLend = (): {
  startLend: (lendingInputs: LendInputDefined[]) => void;
  status: TransactionStatus;
} => {
  const sdk = useSDK();
  const { createRequest, status } = useCreateRequest();

  const startLend = useCallback(
    (lendingInputs: LendInputDefined[]) => {
      if (!sdk) return false;

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
      sortedNfts.forEach(({ nftAddress, tokenId }) => {
        addresses.push(nftAddress);
        tokenIds.push(BigNumber.from(tokenId));
      });
      debug("addresses", addresses);
      debug("tokenIds", tokenIds);
      debug("amounts", amounts);
      debug("maxRentDurations", maxRentDurations);
      debug("dailyRentPrices", dailyRentPrices);
      debug("nftPrice", nftPrice);
      debug("tokens", pmtTokens);

      createRequest(
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
        `
        },
        {
          ids: lendingInputs.map((l) => l.nft.id),
          type: SmartContractEventType.START_LEND
        }
      );
    },
    [sdk, createRequest]
  );

  return { startLend, status };
};
