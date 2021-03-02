import { useContext, useMemo } from "react";
import * as R from "ramda";

import GraphContext, { AddressToErc721, AddressToLending } from "../contexts/Graph";
import { CurrentAddressContext } from "../hardhat/SymfoniContext";
import { Address, NftAndLendRentInfo, LendingRentInfo } from "../types";
import { Lending } from "../types/graph";

type useLendingsReturnT = {
  allRentings: NftAndLendRentInfo[];
  myLendings: NftAndLendRentInfo[];
  allMyRenting: NftAndLendRentInfo[];
};

export const useRenft = (): useLendingsReturnT => {
  const { lendings, erc1155s, erc721s, user } = useContext(GraphContext);
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

  const allMyRenting = useMemo(() => {
    const nfts: NftAndLendRentInfo[] = [];
    if (!user.rentings || !currentAddress) return nfts;
    for (const rentItem of user.rentings) {
        for (const address of Object.keys(erc721s)) {
          if (!R.hasPath([address, "tokenIds"], erc721s)) continue;
          for (const tokenId of Object.keys(erc721s[address].tokenIds)) {
              if (rentItem.lending.tokenId !== tokenId) continue;
              const item = erc721s[address].tokenIds[tokenId] as AddressToErc721;
              const image = item.image as any as string;
              const lendingRentInfo = {
                dailyRentPrice: rentItem.lending.dailyRentPrice,
                maxRentDuration: rentItem.lending.maxRentDuration,
                paymentToken: rentItem.lending.paymentToken,
                nftPrice: rentItem.lending.nftPrice,
              };
              nfts.push({
                contract: erc721s[address].contract,
                tokenId,
                image,
                lendingId: rentItem.lending?.id ?? "",
                lendingRentInfo,
                rentingInfo: rentItem,
              });

          }
        }
    }
    return nfts;
  }, [user, erc721s, erc1155s]);

  const allRentings = useMemo(() => {
    const nfts: NftAndLendRentInfo[] = [];
    if (!lendings || !currentAddress) return nfts;
    for (const address of Object.keys(lendings)) {
      if (!R.hasPath([address, "tokenIds"], lendings)) continue;
      for (const tokenId of Object.keys(lendings[address].tokenIds)) {
        const lending = lendings[address].tokenIds[tokenId] as Lending;
        const iAmLender = lending?.lenderAddress === currentAddress;
        if (iAmLender || !lending) continue;
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
    const nfts: NftAndLendRentInfo[] = [];
    if (!lendings || !currentAddress) return nfts;
    for (const address of Object.keys(lendings)) {
      if (!R.hasPath([address, "tokenIds"], lendings)) continue;
      for (const tokenId of Object.keys(lendings[address].tokenIds)) {
        const lending = lendings[address].tokenIds[tokenId] as Lending;
        const iAmNotLender =
          lendings[address].tokenIds[tokenId]?.lenderAddress !== currentAddress;
        if (iAmNotLender || !lending) continue;
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

  return { allRentings, myLendings, allMyRenting };
};

export default useRenft;
