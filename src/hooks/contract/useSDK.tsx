import { useMemo } from "react";
import { ReNFT } from "@renft/sdk";

import { useContractAddress } from "./useContractAddress";
import { useWallet } from "../useWallet";

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
