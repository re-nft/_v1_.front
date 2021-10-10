import {
  SmartContractEventType,
  TransactionStatus,
} from "renft-front/hooks/store/useEventTrackedTransactions";
import { from, map } from "rxjs";
import { Nft } from "renft-front/types/classes";
import { useCallback, useEffect, useState } from "react";
import { getContractWithSigner, getDistinctItems } from "renft-front/utils";
import { TransactionStateEnum } from "renft-front/types";
import { useContractAddress } from "renft-front/hooks/contract/useContractAddress";
import { useWallet } from "renft-front/hooks/store/useWallet";
import { useCurrentAddress } from "renft-front/hooks/misc/useCurrentAddress";
import { useCreateRequest } from "renft-front/hooks/store/useCreateRequest";

type NFTApproval = Pick<Nft, "nftAddress" | "isERC721" | "tokenId" | "id">;

export function useNFTApproval(nfts: NFTApproval[]): {
  isApprovalForAll: (
    nft: NFTApproval[],
    currentAddress: string,
    contractAddress: string
  ) => Promise<[boolean, NFTApproval[]]>;
  isApproved: boolean;
  approvalStatus: TransactionStatus;
  handleApproveAll: () => void;
} {
  const { createRequest, status: approvalStatus } = useCreateRequest();
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [nonApprovedNft, setNonApprovedNfts] = useState<NFTApproval[]>([]);
  const contractAddress = useContractAddress();
  const currentAddress = useCurrentAddress();
  const { web3Provider: provider, signer } = useWallet();

  // handle approve
  const setApprovalForAll = useCallback(
    (nfts: NFTApproval[], contractAddress: string) => {
      if (!currentAddress) return false;
      if (!nfts || nfts.length < 1) return false;
      const distinctItems = nfts.filter(
        (item, index, all) =>
          all.findIndex((nft) => nft.nftAddress === item.nftAddress) === index
      );
      if (distinctItems.length < 1) return false;
      if (!signer) return false;

      createRequest(
        () =>
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
        },
        {
          ids: distinctItems.map((l) => l.id),
          type: SmartContractEventType.APPROVE_NFT,
        }
      );
    },
    [createRequest, signer, currentAddress]
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
        getDistinctItems(nft, "nftAddress").map((nft: NFTApproval) => {
          return getContractWithSigner(
            nft.nftAddress,
            signer,
            nft.isERC721
          ).then((contract) => {
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
  }, [nfts, currentAddress, contractAddress, isApprovalForAll]);

  useEffect(() => {
    if (approvalStatus?.status === TransactionStateEnum.SUCCESS) {
      setIsApproved(true);
    }
  }, [approvalStatus]);
  // handle function to approve and subscribe to result
  const handleApproveAll = useCallback(() => {
    if (!provider) return;
    setApprovalForAll(nonApprovedNft, contractAddress);
  }, [provider, setApprovalForAll, nonApprovedNft, contractAddress]);

  return {
    isApprovalForAll,
    isApproved,
    approvalStatus,
    handleApproveAll,
  };
}
