import { useCallback, useMemo, useState } from "react";
import { PaymentToken } from "@renft/sdk";
import { BigNumber } from "@ethersproject/bignumber";
import { getDistinctItems, getE20, sortNfts } from "renft-front/utils";
import { MAX_UINT256 } from "renft-front/consts";
import createDebugger from "debug";
import { ERC20 } from "renft-front/types/typechain/ERC20";
import { useSDK } from "./useSDK";
import {
  SmartContractEventType,
  TransactionStatus,
} from "renft-front/hooks/store/useEventTrackedTransactions";
import { useContractAddress } from "renft-front/hooks/contract/useContractAddress";
import { useResolverAddress } from "renft-front/hooks/contract/useResolverAddress";
import { useSmartContracts } from "renft-front/hooks/contract/useSmartContracts";
import { useWallet } from "renft-front/hooks/store/useWallet";
import { useCurrentAddress } from "renft-front/hooks/misc/useCurrentAddress";
import { Lending } from "renft-front/types/classes";
import { useCreateRequest } from "renft-front/hooks/store/useCreateRequest";

const debug = createDebugger("app:contract:startRent");

export type StartRentNft = {
  nftAddress: string;
  tokenId: string;
  lendingId: string;
  rentDuration: string;
  paymentToken: PaymentToken;
  isERC721: boolean;
};

// first approve
export const useRentApproval = (): {
  isApproved: boolean;
  status: TransactionStatus;
  handleApproveAll: () => void;
  checkApprovals: (nfts: Lending[]) => void;
} => {
  const { signer } = useWallet();
  const { Resolver } = useSmartContracts();
  const currentAddress = useCurrentAddress();
  const [approvals, setApprovals] = useState<ERC20[]>();
  const contractAddress = useContractAddress();
  const resolverAddress = useResolverAddress();
  const { createRequest, status } = useCreateRequest();

  const checkApprovals = useCallback(
    (items: Lending[]) => {
      if (!Resolver) return;
      if (!currentAddress) return;
      if (!contractAddress) return;
      if (!signer) return;

      const resolver = Resolver.attach(resolverAddress).connect(signer);
      const nfts = items.map((lending) => ({
        address: lending.nftAddress,
        tokenId: lending.tokenId,
        amount: lending.lentAmount,
        lendingId: lending.id,
        rentDuration: "",
        paymentToken: lending.paymentToken,
        isERC721: lending.isERC721,
      }));
      const promiseTokenAddresses = getDistinctItems(nfts, "paymentToken")
        .map((nft) => nft.paymentToken)
        .map((token) => resolver.getPaymentToken(token));

      Promise.all(promiseTokenAddresses).then((tokenAddresses) => {
        const erc20s = tokenAddresses.map((addr) => getE20(addr, signer));

        const promiseTokenAllowances: Promise<[BigNumber, ERC20]>[] =
          erc20s.map((erc20) => {
            return new Promise((resolve, reject) => {
              erc20
                .allowance(currentAddress, contractAddress)
                .then((allowance: BigNumber) => {
                  resolve([allowance, erc20]);
                })
                .catch((e) => reject([e, erc20]));
            });
          });
        Promise.all(promiseTokenAllowances).then(
          (tokenAllowances: [BigNumber, ERC20][]) => {
            const approvals: ERC20[] = tokenAllowances
              .filter(([allowance]) => {
                return allowance.lt(BigNumber.from(MAX_UINT256).div(2));
              })
              .map(([_, erc20]) => erc20);
            setApprovals(approvals);
          }
        );
      });
    },
    [Resolver, contractAddress, currentAddress, signer, resolverAddress]
  );
  const isApproved = useMemo(() => {
    // use memo as there could be multiple tokens
    // setState is not trusthworth when selecting USCD/DAI first =>isApprove true
    // better to call the smart contracts periodically for allowance check
    // need to optimize this later on
    if (status.isLoading) return false;
    if (!approvals) return true;
    return approvals?.length < 1;
  }, [approvals, status.isLoading]);

  const handleApproveAll = useCallback(() => {
    if (approvals && approvals.length > 0) {
      createRequest(
        () =>
          Promise.all(
            approvals.map((approval) =>
              approval.approve(contractAddress, MAX_UINT256)
            )
          ),
        { action: "Rent approve tokens", label: "" },
        {
          //todo:eniko
          ids: [],
          type: SmartContractEventType.APPROVE_PAYMENT_TOKEN,
        }
      );
    }
  }, [approvals, contractAddress, createRequest]);

  return {
    status,
    checkApprovals,
    handleApproveAll,
    isApproved,
  };
};

export const useStartRent = (): {
  startRent: (nfts: StartRentNft[]) => void;
  status: TransactionStatus;
} => {
  const sdk = useSDK();
  const { createRequest, status } = useCreateRequest();

  const startRent = useCallback(
    (nfts: StartRentNft[]) => {
      if (!sdk) return;
      if (nfts == null) return;
      if (nfts.length < 1) return;

      const sortedNfts = nfts.sort(sortNfts);
      const addresses = sortedNfts.map((nft) => nft.nftAddress);
      const tokenIds = sortedNfts.map((nft) => BigNumber.from(nft.tokenId));
      const lendingIds = sortedNfts.map((nft) => BigNumber.from(nft.lendingId));
      const rentDurations = sortedNfts.map((nft) => Number(nft.rentDuration));

      debug("addresses", addresses);
      debug(
        "tokenIds",
        sortedNfts.map((nft) => nft.tokenId)
      );
      debug(
        "lendingIds",
        sortedNfts.map((nft) => nft.lendingId)
      );
      debug("rentDurations", rentDurations);
      createRequest(
        () => sdk.rent(addresses, tokenIds, lendingIds, rentDurations),
        {
          action: "rent",
          label: `
          addresses: ${addresses}
          tokenIds: ${sortedNfts.map((nft) => nft.tokenId)}
          lendingIds: ${sortedNfts.map((nft) => nft.lendingId)}
          rentDurations: ${rentDurations}
          `,
        },
        {
          ids: nfts.map((l) => l.lendingId),
          type: SmartContractEventType.START_RENT,
        }
      );
    },
    [sdk, createRequest]
  );
  return {
    status,
    startRent,
  };
};
