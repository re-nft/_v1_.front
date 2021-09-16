//@ts-ignore
import { RESOLVER_ADDRESS } from "@eenagy/sdk";
import React, { useContext } from "react";
import { ContractContext } from "../../contexts/ContractsProvider";
import UserContext from "../../contexts/UserProvider";
import { NetworkName } from "../../types";

export const useResolverAddress = (): string => {
  const { Resolver } = useContext(ContractContext);
  const { network } = useContext(UserContext);

  return network === NetworkName.mainnet
    ? RESOLVER_ADDRESS
    : Resolver?.address || "";
};
