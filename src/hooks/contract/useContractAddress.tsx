import { RENFT_ADDRESS } from "@renft/sdk";
import { useContext, useMemo } from "react";
import { ContractContext } from "../../contexts/ContractsProvider";
import { NetworkName } from "../../types";

export const useContractAddress = (): string => {
  const { ReNFT } = useContext(ContractContext);

  return useMemo(() => {
    return process.env.NEXT_PUBLIC_NETWORK_SUPPORTED === NetworkName.mainnet
      ? RENFT_ADDRESS
      : ReNFT?.address || "";
  }, [ReNFT?.address]);
};
