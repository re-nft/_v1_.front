import { BigNumber } from "ethers";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CurrentAddressContextWrapper } from "../contexts/CurrentAddressContextWrapper";
import TransactionStateContext from "../contexts/TransactionState";
import {
  ProviderContext,
  ResolverContext,
  SignerContext,
} from "../hardhat/SymfoniContext";
import { ERC1155 } from "../hardhat/typechain/ERC1155";
import { ERC721 } from "../hardhat/typechain/ERC721";
import { getReNFT } from "../services/get-renft-instance";
import isApprovalForAll from "../services/is-approval-for-all";
import setApprovalForAll from "../services/set-approval-for-all";

export type ReturnNft = {
  address: string;
  tokenId: string;
  lendingId: string;
  amount: string;
  contract: () => ERC721 | ERC1155;
};

export const useReturnIt = (
  nfts: ReturnNft[]
): {
  approveAll: () => Promise<void>;
  isApproved: boolean;
  returnIt: () => Promise<void | boolean>;
} => {
  const [signer] = useContext(SignerContext);
  const [currentAddress] = useContext(CurrentAddressContextWrapper);
  const { instance: resolver } = useContext(ResolverContext);
  const [isApproved, setIsApproved] = useState(false);
  const { setHash } = useContext(TransactionStateContext);
  const [provider] = useContext(ProviderContext);

  const renft = useMemo(() => {
    if (!signer) return;
    return getReNFT(signer);
  }, [signer]);

  useEffect(() => {
    if (!renft || !currentAddress) return;
    isApprovalForAll(nfts, currentAddress)
      .then((isApproved) => {
        setIsApproved(isApproved);
      })
      .catch(() => {
        console.warn("return modal issue with fetch is approval for all");
      });
  }, [nfts, currentAddress, setIsApproved, renft]);

  const approveAll = useCallback(async () => {
    if (!provider) return;
    const [tx] = await setApprovalForAll(nfts);
    setHash(tx.hash);
    const receipt = await provider.getTransactionReceipt(tx.hash);
    const status = receipt.status ?? 0;
    if (status === 1) {
      setIsApproved(true);
    }
  }, [nfts, setHash, provider]);

  const returnIt = useCallback(async () => {
    if (!renft) return;
    if(nfts.length < 1) return;
    const tx = await renft.returnIt(
      nfts.map((nft) => nft.address),
      nfts.map((nft) => BigNumber.from(nft.tokenId)),
      nfts.map((nft) => Number(nft.amount)),
      nfts.map((nft) => BigNumber.from(nft.lendingId))
    );
    const isSuccess = await setHash(tx.hash);
    return isSuccess;
  }, [nfts, renft, setHash]);

  return {
    approveAll,
    isApproved,
    returnIt,
  };
};
