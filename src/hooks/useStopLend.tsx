import { ContractTransaction } from "@ethersproject/contracts";
import { useCallback, useContext, useMemo } from "react";
import { ReNFTContext, SignerContext } from "../hardhat/SymfoniContext";
import { ReNFT } from "@renft/sdk";
import { BigNumber } from "@ethersproject/bignumber";
import { useUserLending } from "../contexts/graph/hooks/useUserLending";

export const useStopLend = (): ((
  nfts: {
    address: string;
    tokenId: string;
    amount: string;
    lendingId: string;
  }[]
) => Promise<void | ContractTransaction>) => {
  const [signer] = useContext(SignerContext);
  const { instance: contract } = useContext(ReNFTContext);
  const { refetchLending } = useUserLending();
  const renft = useMemo(() => {
    if (!signer) return;
    if (!contract) return;
    //TODO:eniko remove ts-ignore
    // @ts-ignore
    return new ReNFT(signer, contract);
  }, [signer, contract]);

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
      const addresses: string[] = [];
      const tokenIds: BigNumber[] = [];
      const lendingIds: BigNumber[] = [];
      const amounts: number[] = [];

      for (const nft of nfts) {
        addresses.push(nft.address);
        tokenIds.push(BigNumber.from(nft.tokenId));
        lendingIds.push(BigNumber.from(nft.lendingId));
        amounts.push(parseFloat(nft.amount));
      }
      return renft
        .stopLending(addresses, tokenIds, amounts, lendingIds)
        .then(() => {
          refetchLending();
        });
    },
    [refetchLending, renft]
  );
};
