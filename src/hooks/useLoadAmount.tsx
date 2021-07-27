import { useContext, useEffect, useState } from "react";
import { from } from "rxjs";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import { Nft } from "../contexts/graph/classes";
import { getContractWithProvider } from "../utils";

export const useLoadAmount = (nft: Nft): string => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const [amount, setAmount] = useState("1");

  useEffect(() => {
    const getAmount = async () => {
      if (nft.isERC721 || !currentAddress) return;
      // not returning the already computed amount because the provider can change and with it the address
      // anothe reason is due to users of renft lending and renting and thus amounts dynamically changing
      else {
        const contract = await getContractWithProvider(nft.address);
        const amount = (
          await contract
            .balanceOf(currentAddress, nft.tokenId)
            .catch(() => "0")
        ).toString();
        setAmount(amount);
      }
    };
    const subscription = from(getAmount()).subscribe()
    return () => {
        subscription?.unsubscribe()
    }
  }, [currentAddress]);

  return amount;
};
