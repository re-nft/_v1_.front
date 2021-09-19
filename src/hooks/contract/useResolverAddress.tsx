import { RESOLVER_ADDRESS } from "@renft/sdk";
import { NetworkName } from "../../types";
import { useWallet } from "../store/useWallet";
import { useSmartContracts } from "./useSmartContracts";

export const useResolverAddress = (): string => {
  const { Resolver } = useSmartContracts();
  const { network } = useWallet();

  return network === NetworkName.mainnet
    ? RESOLVER_ADDRESS
    : Resolver?.address || "";
};
