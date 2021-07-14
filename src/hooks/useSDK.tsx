import { useContext, useMemo } from "react";
import { useContractAddress } from "../contexts/StateProvider";
import UserContext from "../contexts/UserProvider";
import { getReNFT } from "../services/get-renft-instance";

export const useSDK = () => {
  const { signer } = useContext(UserContext);
  const contractAddress = useContractAddress();

  const renft = useMemo(() => {
    if (!signer) return;
    if (!contractAddress) return;
    return getReNFT(signer, contractAddress);
  }, [contractAddress, signer]);
  return renft;
};
