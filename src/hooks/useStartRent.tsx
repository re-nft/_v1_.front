import { useCallback, useContext, useMemo, useState } from "react";
import { PaymentToken } from "@renft/sdk";
import { BigNumber } from "ethers";
import { getDistinctItems, getE20, sortNfts } from "../utils";
import { MAX_UINT256 } from "../consts";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import createDebugger from "debug";
import { ERC20 } from "../hardhat/typechain/ERC20";
import { useContractAddress } from "../contexts/StateProvider";
import TransactionStateContext from "../contexts/TransactionState";
import { SnackAlertContext } from "../contexts/SnackProvider";
import UserContext from "../contexts/UserProvider";
import { ContractContext } from "../contexts/ContractsProvider";
import { useSDK } from "./useSDK";
import { useTransactionWrapper } from "./useTransactionWrapper";

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
  startRent: (nfts: StartRentNft[]) => Promise<void | boolean>;
  handleApproveAll: () => void;
  checkApprovals: (nfts: StartRentNft[]) => void;
  isApprovalLoading: boolean;
} => {
  const { signer } = useContext(UserContext);
  const { Resolver } = useContext(ContractContext);
  const currentAddress = useContext(CurrentAddressWrapper);
  const [approvals, setApprovals] = useState<ERC20[]>();
  const [isApprovalLoading, setApprovalLoading] = useState<boolean>(true);
  const contractAddress = useContractAddress();
  const { setHash } = useContext(TransactionStateContext);
  const { setError } = useContext(SnackAlertContext);
  const sdk = useSDK();
  const transactionWrapper = useTransactionWrapper();

  const checkApprovals = useCallback(
    (nfts: StartRentNft[]) => {
      if (!Resolver) return;
      if (!currentAddress) return;
      if (!contractAddress) return;
      if (!signer) return;

      setApprovalLoading(true);
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
            setApprovalLoading(false);
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
    if (isApprovalLoading) return false;
    if (!approvals) return true;
    return approvals?.length < 1;
  }, [approvals, isApprovalLoading]);

  const handleApproveAll = useCallback(() => {
    if (approvals && approvals.length > 0) {
      setApprovalLoading(true);
      Promise.all(
        approvals.map((approval) =>
          approval.approve(contractAddress, MAX_UINT256)
        )
      )
        .then((hashes) => {
          if (hashes.length > 0) return setHash(hashes.map((tx) => tx.hash));
          return Promise.resolve(false);
        })
        .then((status) => {
          if (!status) setError("Transaction is not successful!", "warning");
          setApprovalLoading(false);
          setApprovals([]);
        })
        .catch((e) => {
          setApprovalLoading(false);
          setError(e.message, "error");
        });
    }
  }, [approvals, contractAddress, setError, setHash]);

  const startRent = useCallback(
    async (nfts: StartRentNft[]) => {
      if (!sdk) return Promise.resolve();

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
      return  transactionWrapper(sdk
        .rent(addresses, tokenIds, lendingIds, rentDurations))
    },
    [sdk]
  );

  return {
    startRent,
    checkApprovals,
    handleApproveAll,
    isApproved,
    isApprovalLoading
  };
};
