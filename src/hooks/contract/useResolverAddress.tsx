import { RESOLVER_ADDRESS } from "@renft/sdk";
import { NetworkName } from "renft-front/types";
import { useWallet } from "renft-front/hooks/store/useWallet";
import { useSmartContracts } from "renft-front/hooks/contract/useSmartContracts";

export const useResolverAddress = (): string => {
  const { Resolver } = useSmartContracts();
  const { network } = useWallet();

  return network === NetworkName.mainnet
    ? RESOLVER_ADDRESS
    : Resolver?.address || "";
};
