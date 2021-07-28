import { useCallback, useContext, useEffect, useMemo } from "react";
import { from } from "rxjs";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import { Nft } from "../contexts/graph/classes";
import UserContext from "../contexts/UserProvider";
import { getUniqueCheckboxId } from "../controller/batch-controller";
import { getContractWithSigner } from "../utils";
import { useERC1155 } from "./useFetchERC1155";

export const useLoadAmount = (nft: Nft): string => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { signer } = useContext(UserContext);
  const setAmount = useERC1155((state) => state.setAmount);
  const id = useMemo(() => getUniqueCheckboxId(nft), [nft]);
  const { nfts } = useERC1155(
    useCallback(
      (state) => {
        const selector = state.users[currentAddress];
        if (!selector || !selector.nfts) return { nfts: [], isLoading: false };
        return selector;
      },
      [currentAddress]
    )
  );
  const amount = useMemo(() => {
    if (nft.isERC721) return nft.amount;
    return nfts?.find((nft) => getUniqueCheckboxId(nft) === id)?.amount || "";
  }, [id, nfts]);

  useEffect(() => {
    const getAmount = async () => {
      if (nft.isERC721 || !currentAddress || !signer) return;
      // not returning the already computed amount because the provider can change and with it the address
      // anothe reason is due to users of renft lending and renting and thus amounts dynamically changing
      else {
        const contract = await getContractWithSigner(nft.address, signer);
        const amount = (
          await contract.balanceOf(currentAddress, nft.tokenId).catch(() => "0")
        ).toString();
        console.log('amount', amount)
        setAmount(currentAddress, getUniqueCheckboxId(nft), amount);
      }
    };
    const subscription = from(getAmount()).subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [currentAddress, signer]);

  return amount;
};
