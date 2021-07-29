import { RENFT_ADDRESS } from "@renft/sdk";
import React, { useContext } from "react";
import { ContractContext } from "../contexts/ContractsProvider";
import UserContext from "../contexts/UserProvider";
import { NetworkName } from "../types";

export const useContractAddress = (): string => {
    const { ReNFT } = useContext(ContractContext);
    const { network } = useContext(UserContext);
  
    return network === NetworkName.mainnet ? RENFT_ADDRESS : ReNFT?.address || "";
  };
  