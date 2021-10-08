import { useMemo } from "react";
import { ReNFT } from "@renft/sdk";

import { useContractAddress } from "renft-front/hooks/contract/useContractAddress";
import { useWallet } from "renft-front/hooks/store/useWallet";

export const useSDK = (): ReNFT | undefined => {
  const { signer } = useWallet();
  const contractAddress = useContractAddress();

  const renft = useMemo(() => {
    if (!signer) return;
    if (!contractAddress) return;
    return new ReNFT(signer, contractAddress);
  }, [contractAddress, signer]);

  return renft;
};
