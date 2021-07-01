import { BigNumber } from "ethers";
import { useCallback, useContext, useMemo } from "react";
import { Renting } from "../contexts/graph/classes";
import { SnackAlertContext } from "../contexts/SnackProvider";
import { useContractAddress } from "../contexts/StateProvider";
import TransactionStateContext from "../contexts/TransactionState";
import UserContext from "../contexts/UserProvider";
import { getReNFT } from "../services/get-renft-instance";
import { sortNfts } from "../utils";


export const useReturnIt = (): ((
  nfts: Renting[]
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
    async (nfts: Renting[]) => {
      if (!renft) return;
      if (nfts.length < 1) return;
      const sortedNfts = nfts.sort(sortNfts)
      return await renft
        .returnIt(
          sortedNfts.map((nft) => nft.address),
          sortedNfts.map((nft) => BigNumber.from(nft.tokenId)),
          sortedNfts.map((nft) => BigNumber.from(nft.renting.lendingId))
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
          return false;
        });
    },
    [renft, setError, setHash]
  );
};
