import { useCallback, useMemo, useState } from "react";
import { PaymentToken } from "@renft/sdk";
import { BigNumber } from "ethers";
import { getDistinctItems, getE20, sortNfts } from "../../utils";
import { MAX_UINT256 } from "../../consts";
import createDebugger from "debug";
import { ERC20 } from "../../types/typechain/ERC20";
import { useSDK } from "./useSDK";
import {
  TransactionStatus,
  useCreateRequest
} from "../misc/useOptimisticTransaction";
import { useContractAddress } from "./useContractAddress";
import { useResolverAddress } from "./useResolverAddress";
import { useSmartContracts } from "./useSmartContracts";
import { useWallet } from "../store/useWallet";
import { useCurrentAddress } from "../misc/useCurrentAddress";
import { Lending } from "../../types/classes";

const debug = createDebugger("app:contract:startRent");

export type StartRentNft = {
  address: string;
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
  const [isCheckLoading, setCheckLoading] = useState<boolean>(true);
  const contractAddress = useContractAddress();
  const resolverAddress = useResolverAddress();
  const { createRequest, status } = useCreateRequest();

  const checkApprovals = useCallback(
    (items: Lending[]) => {
      if (!Resolver) return;
      if (!currentAddress) return;
      if (!contractAddress) return;
      if (!signer) return;

      setCheckLoading(true);
      const resolver = Resolver.attach(resolverAddress).connect(signer);
      const nfts = items.map((lending) => ({
        address: lending.nftAddress,
        tokenId: lending.tokenId,
        amount: lending.lentAmount,
        lendingId: lending.id,
        rentDuration: "",
        paymentToken: lending.paymentToken,
        isERC721: lending.isERC721
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
            setCheckLoading(false);
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
    if (isCheckLoading) return false;
    if (status.isLoading) return false;
    if (!approvals) return true;
    return approvals?.length < 1;
  }, [approvals, status.isLoading, isCheckLoading]);

  const handleApproveAll = useCallback(() => {
    if (approvals && approvals.length > 0) {
      createRequest(
        Promise.all(
          approvals.map((approval) =>
            approval.approve(contractAddress, MAX_UINT256)
          )
        ),
        { action: "Rent approve tokens", label: "" }
      );
    }
  }, [approvals, contractAddress, createRequest]);

  return {
    status,
    checkApprovals,
    handleApproveAll,
    isApproved
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
      if (!sdk) return false;

      const sortedNfts = nfts.sort(sortNfts);
      const addresses = sortedNfts.map((nft) => nft.address);
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
        sdk.rent(addresses, tokenIds, lendingIds, rentDurations),
        {
          action: "rent",
          label: `
          addresses: ${addresses}
          tokenIds: ${sortedNfts.map((nft) => nft.tokenId)}
          lendingIds: ${sortedNfts.map((nft) => nft.lendingId)}
          rentDurations: ${rentDurations}
          `
        }
      );
    },
    [sdk, createRequest]
  );
  return {
    status,
    startRent
  };
};
