import { useContext, useMemo } from "react";
import * as R from "ramda";

import GraphContext, { AddressToLending } from "../contexts/Graph";
import { CurrentAddressContext } from "../hardhat/SymfoniContext";
import { Address, NftAndLendingId } from "../types";
import { Lending } from "../types/graph";

type useLendingsReturnT = {
  allRentings: NftAndLendingId[];
  myLendings: NftAndLendingId[];
};

export const useRenft = (): useLendingsReturnT => {
  const { lendings } = useContext(GraphContext);
  const [currentAddress] = useContext(CurrentAddressContext);

  const pickImage = (
    lendings: AddressToLending,
    address: Address,
    tokenId: string
  ) => {
    const image = R.pathOr(
      "",
      [address, "tokenIds", tokenId, "image"],
      lendings
    );
    const imageUrl = R.pathOr(
      "",
      [address, "tokenIds", tokenId, "image_url"],
      lendings
    );
    return image ?? imageUrl;
  };

  const allRentings = useMemo(() => {
    const nfts: NftAndLendingId[] = [];
    if (!lendings || !currentAddress) return nfts;
    for (const address of Object.keys(lendings)) {
      if (!R.hasPath([address, "tokenIds"], lendings)) continue;
      for (const tokenId of Object.keys(lendings[address].tokenIds)) {
        const iAmLender =
          lendings[address].tokenIds[tokenId]?.lenderAddress === currentAddress;
        if (iAmLender) continue;
        const image = pickImage(lendings, address, tokenId);
        nfts.push({
          contract: lendings[address].contract,
          tokenId,
          image,
          lendingId: lendings[address].tokenIds[tokenId]?.id ?? "",
        });
      }
    }
    return nfts;
  }, [lendings, currentAddress]);

  const myLendings = useMemo(() => {
    const nfts: NftAndLendingId[] = [];
    if (!lendings || !currentAddress) return nfts;
    for (const address of Object.keys(lendings)) {
      if (!R.hasPath([address, "tokenIds"], lendings)) continue;
      for (const tokenId of Object.keys(lendings[address].tokenIds)) {
        const iAmNotLender =
          lendings[address].tokenIds[tokenId]?.lenderAddress !== currentAddress;
        if (iAmNotLender) continue;
        const image = pickImage(lendings, address, tokenId);
        nfts.push({
          contract: lendings[address].contract,
          tokenId,
          image,
          lendingId: lendings[address].tokenIds[tokenId]?.id ?? "",
        });
      }
    }
    return nfts;
  }, [lendings, currentAddress]);

  return { allRentings, myLendings };
};

export default useRenft;
