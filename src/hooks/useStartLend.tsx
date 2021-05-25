import { useCallback, useContext, useMemo } from "react";
import {
  SignerContext,
  ReNFTContext,
} from "../hardhat/SymfoniContext";
import { ReNFT, PaymentToken } from "@renft/sdk";
import { BigNumber, ContractTransaction } from "ethers";
import { useUserLending } from "../contexts/graph/hooks/useUserLending";

export const useStartLend = (): ((
  addresses: string[],
  tokenIds: BigNumber[],
  lendAmounts: number[],
  maxRentDurations: number[],
  dailyRentPrices: number[],
  nftPrice: number[],
  tokens: PaymentToken[]
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
      if (!renft) return Promise.resolve();

      return renft
        .lend(
          addresses,
          tokenIds,
          amounts,
          maxRentDurations,
          dailyRentPrices,
          nftPrice,
          tokens
        )
        .then((v) => {
          refetchLending();
          return v;
        })
        .catch((e) => {
          console.log(e)
          return;
        });
    },
    [refetchLending, renft]
  );
  return startLend;
};
