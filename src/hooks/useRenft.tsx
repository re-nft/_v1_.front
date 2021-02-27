import { useContext, useMemo } from "react";
import * as R from "ramda";

import GraphContext, { AddressToLending } from "../contexts/Graph";
import { CurrentAddressContext } from "../hardhat/SymfoniContext";
import { Address, NftAndLendingId, LendingRentInfo } from "../types";
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
        const lending = lendings[address].tokenIds[tokenId] as Lending;
        const iAmLender = lending?.lenderAddress === currentAddress;
        if (iAmLender) continue;
        const image = pickImage(lendings, address, tokenId);
        const lendingRentInfo: LendingRentInfo = {
          dailyRentPrice: lending.dailyRentPrice,
          maxRentDuration: lending.maxRentDuration,
          paymentToken: lending.paymentToken,
          nftPrice: lending.nftPrice,
        };
        nfts.push({
          contract: lendings[address].contract,
          tokenId,
          image,
          lendingId: lending?.id ?? "",
          lendingRentInfo,
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
        const lending = lendings[address].tokenIds[tokenId] as Lending;
        const iAmNotLender =
          lendings[address].tokenIds[tokenId]?.lenderAddress !== currentAddress;
        if (iAmNotLender) continue;
        const image = pickImage(lendings, address, tokenId);
        const lendingRentInfo: LendingRentInfo = {
          dailyRentPrice: lending.dailyRentPrice,
          maxRentDuration: lending.maxRentDuration,
          paymentToken: lending.paymentToken,
          nftPrice: lending.nftPrice,
        };

        nfts.push({
          contract: lendings[address].contract,
          tokenId,
          image,
          lendingId: lendings[address].tokenIds[tokenId]?.id ?? "",
          lendingRentInfo,
        });
      }
    }
    return nfts;
  }, [lendings, currentAddress]);

  return { allRentings, myLendings };
};

export default useRenft;
