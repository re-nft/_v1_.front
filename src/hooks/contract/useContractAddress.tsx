import { RENFT_ADDRESS } from "@renft/sdk";
import { useMemo } from "react";
import { NetworkName } from "renft-front/types";
import { useSmartContracts } from "renft-front/hooks/contract/useSmartContracts";

export const useContractAddress = (): string => {
  const { ReNFT } = useSmartContracts();

  return useMemo(() => {
    return process.env.NEXT_PUBLIC_NETWORK_SUPPORTED === NetworkName.mainnet
      ? RENFT_ADDRESS
      : ReNFT?.address || "";
  }, [ReNFT?.address]);
};
