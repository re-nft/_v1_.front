import { useCallback } from "react";
import { BigNumber } from "ethers";
import createDebugger from "debug";
import { useSDK } from "./useSDK";
import {
  SmartContractEventType,
  TransactionStatus
} from "../store/useEventTrackedTransactions";
import { sortNfts } from "../../utils";
import { LendInputDefined } from "../../components/forms/lend/lend-types";
import { useCreateRequest } from "../store/useCreateRequest";

const debug = createDebugger("app:contract");

const sortParams = (nfts: LendInputDefined[]) => {
  const amounts: number[] = [];
  const maxRentDurations: number[] = [];
  const dailyRentPrices: number[] = [];
  const nftPrice: number[] = [];
  const addresses: string[] = [];
  const tokenIds: BigNumber[] = [];
  const pmtTokens: number[] = [];

  const sortedNfts = Object.values(nfts)
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


  return {
    amounts,
    maxRentDurations,
    dailyRentPrices,
    nftPrice,
    addresses,
    tokenIds,
    pmtTokens
  }

}

const debugParams = (params: ReturnType<typeof sortParams>) => {
  debug("addresses", params.addresses);
  debug("tokenIds", params.tokenIds);
  debug("amounts", params.amounts);
  debug("maxRentDurations", params.maxRentDurations);
  debug("dailyRentPrices", params.dailyRentPrices);
  debug("nftPrice", params.nftPrice);
  debug("tokens", params.pmtTokens);
}

const getGAParams = (params: ReturnType<typeof sortParams>) => {
  return {
    action: "lend",
    label: `
        addresses: ${params.addresses}
        tokenIds: ${params.tokenIds}
        amounts: ${params.amounts}
        maxRentDurations: ${params.maxRentDurations}
        dailyRentPrices: ${params.dailyRentPrices}
        nftPrice: ${params.nftPrice}
        tokens: ${params.pmtTokens}
        `
  };
}

export const useStartLend = (): {
  startLend: (lendingInputs: LendInputDefined[]) => void;
  status: TransactionStatus;
} => {
  const sdk = useSDK();
  const { createRequest, status } = useCreateRequest();

  const startLend = useCallback(
    (lendingInputs: LendInputDefined[]) => {
      if (!sdk) return false;
      if (lendingInputs.length < 1) return false;
      const params = sortParams(lendingInputs)
      const gaParams = getGAParams(params);

      //TODO:eniko move this into create request
      debugParams(params)

      createRequest(() => 
        sdk.lend(
          params.addresses,
          params.tokenIds,
          params.amounts,
          params.maxRentDurations,
          params.dailyRentPrices,
          params.nftPrice,
          params.pmtTokens
        ), gaParams,
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
