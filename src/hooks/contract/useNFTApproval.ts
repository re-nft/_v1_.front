import {
  TransactionStatus,
  useTransactionWrapper,
} from "../useTransactionWrapper";
import { EMPTY, from, map, Observable } from "rxjs";
import { Nft } from "../../types/classes";
import { useCallback, useEffect, useState } from "react";
import { getContractWithSigner, getDistinctItems } from "../../utils";
import { useObservable } from "../useObservable";
import { TransactionStateEnum } from "../../types";
import { useContractAddress } from "./useContractAddress";
import { useWallet } from "../useWallet";
import { useCurrentAddress } from "../useCurrentAddress";

type NFTApproval = Pick<Nft, "nftAddress" | "isERC721" | "tokenId">

export function useNFTApproval(nfts: NFTApproval[]): {
  setApprovalForAll: (
    nfts: NFTApproval[],
    currentAddress: string
  ) => Observable<TransactionStatus>;
  isApprovalForAll: (
    nft: NFTApproval[],
    currentAddress: string,
    contractAddress: string
  ) => Promise<[boolean, NFTApproval[]]>;
  isApproved: boolean;
  approvalStatus: TransactionStatus;
  handleApproveAll: () => void;
} {
  const transactionWrapper = useTransactionWrapper();
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [nonApprovedNft, setNonApprovedNfts] = useState<NFTApproval[]>([]);
  const contractAddress = useContractAddress();
  const currentAddress = useCurrentAddress();
  const { web3Provider: provider, signer } = useWallet();
  const [approvalStatus, setObservable] = useObservable();

  // handle approve
  const setApprovalForAll = useCallback(
    (nfts: NFTApproval[], contractAddress: string) => {
      if (!currentAddress) return EMPTY;
      if (!nfts || nfts.length < 1) return EMPTY;
      const distinctItems = nfts.filter(
        (item, index, all) =>
          all.findIndex((nft) => nft.nftAddress === item.nftAddress) === index
      );
      if (distinctItems.length < 1) return EMPTY;
      if (!signer) return EMPTY;

      return transactionWrapper(
        Promise.all(
          distinctItems.map((nft) => {
            return getContractWithSigner(
              nft.nftAddress,
              signer,
              nft.isERC721
            ).then((contract) => {
              return contract.setApprovalForAll(contractAddress, true);
            });
          })
        ),
        {
          action: "nft approval",
          label: `${distinctItems
            .map((t) => `address: ${t.nftAddress} tokenId: ${t.tokenId}`)
            .join(",")}`,
        }
      );
    },
    [transactionWrapper, signer, currentAddress]
  );

  // check if approved
  const isApprovalForAll = useCallback(
    async (
      nft: NFTApproval[],
      currentAddress: string,
      contractAddress: string
    ): Promise<[boolean, NFTApproval[]]> => {
      if (!signer) return [false, []];

      const result = await Promise.all(
        //@ts-ignore
        getDistinctItems(nft, "address").map((nft: NFTApproval) => {
          return getContractWithSigner(nft.nftAddress, signer, nft.isERC721).then(
            (contract) => {
              return contract
                .isApprovedForAll(currentAddress, contractAddress)
                .then((isApproved) => {
                  return [nft, isApproved, null];
                })
                .catch((e) => {
                  return [nft, false, e];
                });
            }
          );
        })
      );
      const nonApproved = result
        .filter(([_, isApproved]) => !isApproved)
        .map(([nft]) => nft);
      return [nonApproved.length < 1, nonApproved];
    },
    [signer]
  );

  // useeffect to check if isapproved or not
  useEffect(() => {
    if (!currentAddress) return;
    if (!contractAddress) return;
    setIsApproved(false);
    const transaction = from(
      isApprovalForAll(nfts, currentAddress, contractAddress).catch(() => {
        console.warn("batch lend issue with is approval for all");
        return null;
      })
    ).pipe(
      map((arg) => {
        if (!arg) return;
        const [status, nonApproved] = arg;
        if (status) setIsApproved(status);
        setNonApprovedNfts(nonApproved);
      })
    );

    const subscription = transaction.subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [nfts, currentAddress, contractAddress, isApprovalForAll]);

  useEffect(() => {
    if (approvalStatus.status === TransactionStateEnum.SUCCESS) {
      setIsApproved(true);
    }
  }, [approvalStatus]);
  // handle function to approve and subscribe to result
  const handleApproveAll = useCallback(() => {
    if (!provider) return;
    setObservable(setApprovalForAll(nonApprovedNft, contractAddress));
  }, [
    provider,
    setApprovalForAll,
    setObservable,
    nonApprovedNft,
    contractAddress,
  ]);

  return {
    setApprovalForAll,
    isApprovalForAll,
    isApproved,
    approvalStatus,
    handleApproveAll,
  };
}
