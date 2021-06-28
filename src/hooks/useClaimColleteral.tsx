import { BigNumber } from "ethers";
import { useCallback, useContext, useMemo } from "react";
import { SnackAlertContext } from "../contexts/SnackProvider";
import { useContractAddress } from "../contexts/StateProvider";
import TransactionStateContext from "../contexts/TransactionState";
import UserContext from "../contexts/UserProvider";
import { getReNFT } from "../services/get-renft-instance";

export const useClaimColleteral = (): ((
  nfts: {
    address: string;
    tokenId: string;
    lendingId: string;
  }[]
) => Promise<void | boolean>) => {
  const { signer } = useContext(UserContext);
  const contractAddress = useContractAddress();
  const { setHash } = useContext(TransactionStateContext);
  const { setError } = useContext(SnackAlertContext);

  const renft = useMemo(() => {
    if (!signer) return;
    if (!contractAddress) return;
    return getReNFT(signer, contractAddress);
  }, [contractAddress, signer]);

  return useCallback(
    (
      nfts: {
        address: string;
        tokenId: string;
        lendingId: string;
      }[]
    ) => {
      if (!renft) return Promise.reject();
      return renft
        .claimCollateral(
          nfts.map((nft) => nft.address),
          nfts.map((nft) => BigNumber.from(nft.tokenId)),
          nfts.map((nft) => BigNumber.from(nft.lendingId))
        )
        .then((tx) => {
          if (tx) return setHash(tx.hash);
          return Promise.resolve(false);
        })
        .then((status) => {
          if (!status) setError("Transaction is not successful!", "warning");
          return Promise.resolve(status);
        })
        .catch((e) => {
          setError(e.message, "error");
        });
    },
    [renft, setError, setHash]
  );
};
