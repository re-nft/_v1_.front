import { BigNumber } from "ethers";
import { useCallback, useContext, useMemo } from "react";
import { Lending } from "../contexts/graph/classes";
import { SnackAlertContext } from "../contexts/SnackProvider";
import { useContractAddress } from "../contexts/StateProvider";
import TransactionStateContext from "../contexts/TransactionState";
import UserContext from "../contexts/UserProvider";
import { getReNFT } from "../services/get-renft-instance";
import { sortNfts } from "../utils";
import createDebugger from "debug";

const debug = createDebugger("app:contracts:useClaimColleteral");

export const useClaimColleteral = (): ((
  nfts: Lending[]
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
    (nfts: Lending[]) => {
      if (!renft) return Promise.reject();
      const sortedNfts = nfts.sort(sortNfts);
      const params: [string[], BigNumber[], BigNumber[]] = [
        sortedNfts.map((nft) => nft.address),
        sortedNfts.map((nft) => BigNumber.from(nft.tokenId)),
        sortedNfts.map((nft) => BigNumber.from(nft.renting?.lendingId))
      ];
      debug("Claim modal addresses ", sortedNfts.map((nft) => nft.address))
      debug("Claim modal tokenId ", sortedNfts.map((nft) =>nft.tokenId))
      debug("Claim modal lendingId ", sortedNfts.map((nft) =>nft.renting?.lendingId))
      return renft
        .claimCollateral(...params)
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
