import { useContext, useMemo } from "react";
import { ReNFT } from "@renft/sdk";

import { useContractAddress } from "../contexts/StateProvider";
import UserContext from "../contexts/UserProvider";
import { getReNFT } from "../services/get-renft-instance";


export const useSDK = (): ReNFT | undefined => {
  const { signer } = useContext(UserContext);
  const contractAddress = useContractAddress();

  const renft = useMemo(() => {
    if (!signer) return;
    if (!contractAddress) return;
    return getReNFT(signer, contractAddress);
  }, [contractAddress, signer]);

  return renft;
};
