import { BigNumber, ContractTransaction } from "ethers";
import { useCallback, useContext, useMemo } from "react";
import { useContractAddress } from "../contexts/StateProvider";
import { SignerContext } from "../hardhat/SymfoniContext";
import { getReNFT } from "../services/get-renft-instance";

export const useClaimColleteral = (): ((
  nfts: {
    address: string;
    tokenId: string;
    amount: string;
    lendingId: string;
  }[]
) => Promise<void | ContractTransaction>) => {
  const [signer] = useContext(SignerContext);
  const contractAddress = useContractAddress();

  const renft = useMemo(() => {
    if (!signer) return;
    return getReNFT(signer, contractAddress);
  }, [contractAddress, signer]);

  return useCallback(
    (
      nfts: {
        address: string;
        tokenId: string;
        amount: string;
        lendingId: string;
      }[]
    ) => {
      if (!renft) return Promise.reject();
      return renft.claimCollateral(
        nfts.map((nft) => nft.address),
        nfts.map((nft) => BigNumber.from(nft.tokenId)),
        nfts.map((nft) => Number(nft.amount)),
        nfts.map((nft) => BigNumber.from(nft.lendingId))
      );
    },
    [renft]
  );
};
