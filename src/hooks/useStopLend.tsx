import { useCallback, useContext, useMemo } from "react";
import { ContractTransaction } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import { SignerContext } from "../hardhat/SymfoniContext";
import { getReNFT } from "../services/get-renft-instance";

export const useStopLend = (): ((
  nfts: {
    address: string;
    tokenId: string;
    amount: string;
    lendingId: string;
  }[]
) => Promise<void | ContractTransaction>) => {
  const [signer] = useContext(SignerContext);
  const renft = useMemo(() => {
    if (!signer) return;
    return getReNFT(signer);
  }, [signer]);
  return useCallback(
    (
      nfts: {
        address: string;
        tokenId: string;
        amount: string;
        lendingId: string;
      }[]
    ) => {
      if (!renft) return Promise.resolve();
      const arr: [string[], BigNumber[], number[], BigNumber[]] = [
        nfts.map((nft) => nft.address),
        nfts.map((nft) => BigNumber.from(nft.tokenId)),
        nfts.map((nft) => Number(nft.amount)),
        nfts.map((nft) => BigNumber.from(nft.lendingId)),
      ];
      return renft.stopLending(...arr).catch((e) => {
        return;
      });
    },
    [renft]
  );
};
