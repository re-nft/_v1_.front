import { useCallback, useContext, useMemo } from "react";
import { ContractTransaction } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import { getReNFT } from "../services/get-renft-instance";
import UserContext from "../contexts/UserProvider";
import createDebugger from "debug";

const debug = createDebugger('app:contracts:usestoplend')

export const useStopLend = (): ((
  nfts: {
    address: string;
    tokenId: string;
    lendingId: string;
  }[]
) => Promise<void | ContractTransaction>) => {
  const { signer } = useContext(UserContext);
  const renft = useMemo(() => {
    if (!signer) return;
    return getReNFT(signer);
  }, [signer]);
  return useCallback(
    (
      nfts: {
        address: string;
        tokenId: string;
        lendingId: string;
      }[]
    ) => {
      if (!renft) return Promise.resolve();
      const arr: [string[], BigNumber[], BigNumber[]] = [
        nfts.map((nft) => nft.address),
        nfts.map((nft) => BigNumber.from(nft.tokenId)),
        nfts.map((nft) => BigNumber.from(nft.lendingId)),
      ];
      return renft.stopLending(...arr).catch(() => {
        debug("could not stop lending. maybe someone is renting this nft.");
        return;
      });
    },
    [renft]
  );
};
