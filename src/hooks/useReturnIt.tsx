import { BigNumber } from "ethers";
import { useCallback } from "react";
import { Renting } from "../contexts/graph/classes";
import { sortNfts } from "../utils";
import { useSDK } from "./useSDK";
import { useTransactionWrapper } from "./useTransactionWrapper";

export const useReturnIt = (): ((
  nfts: Renting[]
) => Promise<void | boolean>) => {
  const sdk = useSDK();
  const transactionWrapper = useTransactionWrapper();

  return useCallback(
    async (nfts: Renting[]) => {
      if (!sdk) return;
      if (nfts.length < 1) return;
      const sortedNfts = nfts.sort(sortNfts);
      return await transactionWrapper(
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
