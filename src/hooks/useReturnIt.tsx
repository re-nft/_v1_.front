import { BigNumber } from "ethers";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CurrentAddressContextWrapper } from "../contexts/CurrentAddressContextWrapper";
import TransactionStateContext from "../contexts/TransactionState";
import UserContext from "../contexts/UserProvider";
import { ERC1155 } from "../hardhat/typechain/ERC1155";
import { ERC721 } from "../hardhat/typechain/ERC721";
import { getReNFT } from "../services/get-renft-instance";

export type ReturnNft = {
  id: string;
  address: string;
  tokenId: string;
  lendingId: string;
  amount: string;
  contract: () => ERC721 | ERC1155;
};

export const useReturnIt = (
  nfts: ReturnNft[]
): (() => Promise<void | boolean>) => {
  const {signer} = useContext(UserContext);
  const { setHash } = useContext(TransactionStateContext);

  const renft = useMemo(() => {
    if (!signer) return;
    return getReNFT(signer);
  }, [signer]);

  return useCallback(async () => {
    if (!renft) return;
    if (nfts.length < 1) return;
    const tx = await renft.returnIt(
      nfts.map((nft) => nft.address),
      nfts.map((nft) => BigNumber.from(nft.tokenId)),
      nfts.map((nft) => Number(nft.amount)),
      nfts.map((nft) => BigNumber.from(nft.lendingId))
    );
    const isSuccess = await setHash(tx.hash);
    return isSuccess;
  }, [nfts, renft, setHash]);
};
