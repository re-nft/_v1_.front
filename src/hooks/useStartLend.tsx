import { useCallback, useContext, useMemo } from "react";
import { SignerContext } from "../hardhat/SymfoniContext";
import { ReNFT, PaymentToken } from "@renft/sdk";
import { BigNumber, ContractTransaction } from "ethers";
import { UserLendingContext } from "../contexts/UserLending";

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
  const { refetchLending } = useContext(UserLendingContext);

  const renft = useMemo(() => {
    if (!signer) return;
    return new ReNFT(signer);
  }, [signer]);

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
        .catch(() => {
          console.warn("could not start lend");
          return;
        });
    },
    [refetchLending, renft]
  );
  return startLend;
};
