import { useContext, useEffect, useState } from "react";
import { from } from "rxjs";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import { Nft } from "../contexts/graph/classes";
import UserContext from "../contexts/UserProvider";
import { getContractWithSigner } from "../utils";

export const useLoadAmount = (nft: Nft): string => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { signer } = useContext(UserContext);
  const [amount, setAmount] = useState("1");

  useEffect(() => {
    const getAmount = async () => {
      if (nft.isERC721 || !currentAddress || !signer) return;
      // not returning the already computed amount because the provider can change and with it the address
      // anothe reason is due to users of renft lending and renting and thus amounts dynamically changing
      else {
        const contract = await getContractWithSigner(
          nft.address,
          signer,
          nft.isERC721
        );
        const amount = await contract
          .balanceOf(currentAddress, nft.tokenId)
          .catch((e) => {
            console.log(e);
            return "0";
          });
        setAmount(amount.toString());
      }
    };
    const subscription = from(getAmount()).subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [currentAddress, signer]);

  return amount;
};
