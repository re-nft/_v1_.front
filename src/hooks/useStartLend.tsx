import { useCallback, useContext, useMemo } from "react";
import { PaymentToken } from "@renft/sdk";
import { getReNFT } from "../services/get-renft-instance";
import { BigNumber } from "ethers";
import { SignerContext } from "../hardhat/SymfoniContext";
import { useContractAddress } from "../contexts/StateProvider";
import createDebugger from "debug";
import { SnackAlertContext } from "../contexts/SnackProvider";
import TransactionStateContext from "../contexts/TransactionState";

// ENABLE with DEBUG=* or DEBUG=FETCH,Whatever,ThirdOption
const debug = createDebugger("app:contract");
//const debug = console.log;

export const useStartLend = (): ((
  addresses: string[],
  tokenIds: BigNumber[],
  lendAmounts: number[],
  maxRentDurations: number[],
  dailyRentPrices: number[],
  nftPrice: number[],
  tokens: PaymentToken[]
) => Promise<void | boolean>) => {
  const [signer] = useContext(SignerContext);
  const contractAddress = useContractAddress();
  const { setError }  = useContext(SnackAlertContext)
  const { setHash } = useContext(TransactionStateContext);

  const renft = useMemo(() => {
    if (!signer) return;
    if (!contractAddress) return;
    return getReNFT(signer, contractAddress);
  }, [contractAddress, signer]);

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
        .then((tx) => {
          if (tx) return setHash(tx.hash);
          return Promise.resolve(false)
        })
        .then((status) => {
          if (!status) setError('Transaction is not successful!', 'warning')
          return Promise.resolve(status)
        })
        .catch((e) => {
          console.warn("could not start lend");
          setError(e.message, 'error')
          return;
        });
    },
    [renft, setError, setHash]
  );
  return startLend;
};
