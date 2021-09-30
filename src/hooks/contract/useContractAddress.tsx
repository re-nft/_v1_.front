import { RENFT_ADDRESS } from "@renft/sdk";
import { useMemo } from "react";
import { NetworkName } from "../../types";
import { useSmartContracts } from "./useSmartContracts";

export const useContractAddress = (): string => {
  const { ReNFT } = useSmartContracts();

  return useMemo(() => {
    return process.env.NEXT_PUBLIC_NETWORK_SUPPORTED === NetworkName.mainnet
      ? RENFT_ADDRESS
      : ReNFT?.address || "";
  }, [ReNFT?.address]);
};
