import {
  TransactionStatus,
  useTransactionWrapper
} from "./useTransactionWrapper";
import { EMPTY, from, map, Observable } from "rxjs";
import { Nft } from "../contexts/graph/classes";
import { useCallback, useContext, useEffect, useState } from "react";
import { getContractWithSigner, getDistinctItems } from "../utils";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import UserContext from "../contexts/UserProvider";
import { useObservable } from "./useObservable";
import { TransactionStateEnum } from "../types";
import { useContractAddress } from "./useContractAddress";

export function useNFTApproval(nfts: Nft[]): {
  setApprovalForAll: (
    nfts: Nft[],
    currentAddress: string
  ) => Observable<TransactionStatus>;
  isApprovalForAll: (
    nft: Nft[],
    currentAddress: string,
    contractAddress: string
  ) => Promise<[boolean, Nft[]]>;
  isApproved: boolean;
  approvalStatus: TransactionStatus;
  handleApproveAll: () => void;
} {
  const transactionWrapper = useTransactionWrapper();
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [nonApprovedNft, setNonApprovedNfts] = useState<Nft[]>([]);
  const contractAddress = useContractAddress();
  const currentAddress = useContext(CurrentAddressWrapper);
  const { web3Provider: provider, signer } = useContext(UserContext);
  const [approvalStatus, setObservable] = useObservable();

  // handle approve
  const setApprovalForAll = useCallback(
    (nfts: Nft[], contractAddress: string) => {
      if (!currentAddress) return EMPTY;
      if (!nfts || nfts.length < 1) return EMPTY;
      const distinctItems = nfts.filter(
        (item, index, all) =>
          all.findIndex((nft) => nft.address === item.address) === index
      );
      if (distinctItems.length < 1) return EMPTY;
      if (!signer) return EMPTY;

      return transactionWrapper(
        Promise.all(
          distinctItems.map((nft) => {
            return getContractWithSigner(nft.address, signer, nft.isERC721).then(
              (contract) => {
                return contract.setApprovalForAll(contractAddress, true);
              }
            );
          })
        ),
        {action: 'nft approval', label: `${distinctItems.map((t => `address: ${t.address} tokenId: ${t.tokenId}`)).join(',')}`}
      );
    },
    [transactionWrapper, signer]
  );

  // check if approved
  const isApprovalForAll = useCallback(
    async (
      nft: Nft[],
      currentAddress: string,
      contractAddress: string
    ): Promise<[boolean, Nft[]]> => {
      if (!signer) return [false, []];

      const result = await Promise.all(
        getDistinctItems(nft, "address").map((nft) => {
          return getContractWithSigner(nft.address, signer, nft.isERC721).then((contract) => {
            return contract
              .isApprovedForAll(currentAddress, contractAddress)
              .then((isApproved) => {
                return [nft, isApproved, null];
              })
              .catch((e) => {
                return [nft, false, e];
              });
          });
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
  }, [nfts, currentAddress, contractAddress]);

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
    currentAddress
  ]);

  return {
    setApprovalForAll,
    isApprovalForAll,
    isApproved,
    approvalStatus,
    handleApproveAll
  };
}
