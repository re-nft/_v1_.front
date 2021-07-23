import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PaymentToken } from "@renft/sdk";
import { BigNumber } from "ethers";
import { getDistinctItems, getE20, sortNfts } from "../utils";
import { MAX_UINT256 } from "../consts";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import createDebugger from "debug";
import { ERC20 } from "../hardhat/typechain/ERC20";
import { useContractAddress } from "../contexts/StateProvider";
import UserContext from "../contexts/UserProvider";
import { ContractContext } from "../contexts/ContractsProvider";
import { useSDK } from "./useSDK";
import {
  TransactionStatus,
  useTransactionWrapper
} from "./useTransactionWrapper";
import { EMPTY, Observable } from "rxjs";
import { useObservable } from "./useObservable";
import { TransactionStateEnum } from "../types";

const debug = createDebugger("app:contract:startRent");

export type StartRentNft = {
  address: string;
  tokenId: string;
  lendingId: string;
  rentDuration: string;
  paymentToken: PaymentToken;
  isERC721: boolean;
};

export const useStartRent = (): {
  isApproved: boolean;
  startRent: (nfts: StartRentNft[]) => Observable<TransactionStatus>;
  handleApproveAll: () => void;
  checkApprovals: (nfts: StartRentNft[]) => void;
  approvalStatus: TransactionStatus;
} => {
  const { signer } = useContext(UserContext);
  const { Resolver } = useContext(ContractContext);
  const currentAddress = useContext(CurrentAddressWrapper);
  const [approvals, setApprovals] = useState<ERC20[]>();
  const [isCheckLoading, setCheckLoading] = useState<boolean>(true);
  const contractAddress = useContractAddress();
  const sdk = useSDK();
  const transactionWrapper = useTransactionWrapper();
  const [approvalStatus, setObservable] = useObservable();

  const checkApprovals = useCallback(
    (nfts: StartRentNft[]) => {
      if (!Resolver) return;
      if (!currentAddress) return;
      if (!contractAddress) return;
      if (!signer) return;

      setCheckLoading(true);
      const resolver = Resolver.connect(signer);
      //const deployed = await resolver.deployed()
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
    [Resolver, contractAddress, currentAddress, signer]
  );
  const isApproved = useMemo(() => {
    // use memo as there could be multiple tokens
    // setState is not trusthworth when selecting USCD/DAI first =>isApprove true
    // better to call the smart contracts periodically for allowance check
    // need to optimize this later on
    if (isCheckLoading) return false;
    if (approvalStatus.isLoading) return false;
    if (!approvals) return true;
    return approvals?.length < 1;
  }, [approvals, approvalStatus.isLoading]);

  useEffect(()=>{
    if(approvalStatus.status === TransactionStateEnum.SUCCESS){
      setApprovals([])
    }
  }, [approvalStatus.status])
  
  const handleApproveAll = useCallback(() => {
    if (approvals && approvals.length > 0) {
      setObservable(transactionWrapper(
        Promise.all(
          approvals.map((approval) =>
            approval.approve(contractAddress, MAX_UINT256)
          )
        ),
        {action: "Rent approve tokens", label: ''}
      ))
    }
  }, [approvals, contractAddress]);

  const startRent = useCallback(
    (nfts: StartRentNft[]) => {
      if (!sdk) return EMPTY;

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
      return transactionWrapper(
        sdk.rent(addresses, tokenIds, lendingIds, rentDurations),
        {
          action: 'rent',
          label: `
          addresses: ${addresses}
          tokenIds: ${sortedNfts.map((nft) => nft.tokenId)}
          lendingIds: ${sortedNfts.map((nft) => nft.lendingId)}
          rentDurations: ${rentDurations}
          `
        }
      );
    },
    [sdk]
  );

  return {
    startRent,
    checkApprovals,
    handleApproveAll,
    isApproved,
    approvalStatus: {
      ...approvalStatus
    }
  };
};
