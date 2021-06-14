import { useCallback, useContext, useMemo } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { getReNFT } from "../services/get-renft-instance";
import createDebugger from "debug";
import { useContractAddress } from "../contexts/StateProvider";
import { SnackAlertContext } from "../contexts/SnackProvider";
import TransactionStateContext from "../contexts/TransactionState";
import UserContext from "../contexts/UserProvider";

const debug = createDebugger("app:contracts:usestoplend");

export const useStopLend = (): ((
  nfts: {
    address: string;
    tokenId: string;
    lendingId: string;
    amount: string;
  }[]
) => Promise<void | boolean>) => {
  const {signer} = useContext(UserContext);
  const contractAddress = useContractAddress();
  const { setError } = useContext(SnackAlertContext);
  const { setHash } = useContext(TransactionStateContext);

  const renft = useMemo(() => {
    if (!signer) return;
    if (!contractAddress) return;

    return getReNFT(signer, contractAddress);
  }, [signer, contractAddress]);

  return useCallback(
    (
      nfts: {
        address: string;
        tokenId: string;
        lendingId: string;
        amount: string;
      }[]
    ) => {
      if (!renft) return Promise.resolve();
      const arr: [string[], BigNumber[], number[], BigNumber[]] = [
        nfts.map((nft) => nft.address),
        nfts.map((nft) => BigNumber.from(nft.tokenId)),
        nfts.map((nft) => Number(nft.amount)),
        nfts.map((nft) => BigNumber.from(nft.lendingId)),
      ];
      return renft
        .stopLending(...arr)
        .then((tx) => {
          if (tx) return setHash(tx.hash);
          return Promise.resolve(false);
        })
        .then((status) => {
          if (!status) setError("Transaction is not successful!", "warning");
          return Promise.resolve(status);
        })
        .catch((e) => {
          debug("could not stop lending. maybe someone is renting this nft.");
          setError(e.message, "error");
          return Promise.resolve(false);
        });
    },
    [renft, setError, setHash]
  );
};
