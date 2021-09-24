import { useCallback, useMemo, useState } from "react";
import { BigNumber } from "ethers";
import createDebugger from "debug";
import { useSDK } from "./useSDK";
import {
  TransactionStatus,
  useOptimisticTransaction
} from "../misc/useOptimisticTransaction";
import { sortNfts } from "../../utils";
import { LendInputDefined } from "../../components/forms/lend/lend-types";
import { TransactionStateEnum } from "../../types";

const debug = createDebugger("app:contract");

export const useStartLend = (): {
  startLend: (lendingInputs: LendInputDefined[]) => void;
  status: TransactionStatus;
} => {
  const sdk = useSDK();
  const { createTransaction, transactionRequests, pendingTransactionRequests } =
    useOptimisticTransaction();
  const [requestId, setRequestId] = useState<string>();

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

      const id = createTransaction(
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
        }
      );
      setRequestId(id);
    },
    [sdk, createTransaction]
  );
  const request = useMemo(() => {
    return requestId ? transactionRequests[requestId] : null;
  }, [requestId, transactionRequests]);
  const status = useMemo(() => {
    console.log(pendingTransactionRequests)
    return (
      request?.transactionStatus || {
        isLoading: true,
        hasFailure: false,
        status: TransactionStateEnum.WAITING_FOR_SIGNATURE
      }
    );
  }, [request, pendingTransactionRequests]);
  return { startLend, status };
};
