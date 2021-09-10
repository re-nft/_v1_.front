import { useContext, useMemo } from "react";
//@ts-ignore
import { ReNFT } from "@eenagy/sdk";

import UserContext from "../../contexts/UserProvider";
import { useContractAddress } from "./useContractAddress";


export const useSDK = (): ReNFT | undefined => {
  const { signer } = useContext(UserContext);
  const contractAddress = useContractAddress();

  const renft = useMemo(() => {
    if (!signer) return;
    if (!contractAddress) return;
    return new ReNFT(signer, contractAddress);
  }, [contractAddress, signer]);

  return renft;
};
