import { useCallback, useContext, useMemo } from "react";
import { SignerContext } from "../hardhat/SymfoniContext";
import { PaymentToken } from "@renft/sdk";
import { getReNFT } from "../services/get-renft-instance";
import { BigNumber, ContractTransaction } from "ethers";
import createDebugger from "debug";

// ENABLE with DEBUG=* or DEBUG=FETCH,Whatever,ThirdOption
const debug = createDebugger("app:contract");

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

  const renft = useMemo(() => {
    if (!signer) return;
    return getReNFT(signer);
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

      debug("addresses", addresses);
      debug("tokenIds", tokenIds);
      debug("amounts", amounts);
      debug("maxRentDurations", maxRentDurations);
      debug("dailyRentPrices", dailyRentPrices);
      debug("nftPrice", nftPrice);
      debug("tokens", tokens);
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
          return v;
        })
        .catch((e) => {
          console.warn("could not start lend");
          return;
        });
    },
    [renft]
  );
  return startLend;
};
