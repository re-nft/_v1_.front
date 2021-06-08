import { useCallback, useContext, useMemo, useState } from "react";
import { PaymentToken } from "@renft/sdk";
import { getReNFT } from "../services/get-renft-instance";
import { BigNumber, ContractTransaction } from "ethers";
import { getDistinctItems, getE20 } from "../utils";
import { MAX_UINT256 } from "../consts";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import createDebugger from "debug";
import { ERC20 } from "../hardhat/typechain/ERC20";
import { ResolverContext, SignerContext } from "../hardhat/SymfoniContext";
import { useContractAddress } from "../contexts/StateProvider";
import TransactionStateContext from "../contexts/TransactionState";

const debug = createDebugger("app:contract:startRent");

export type StartRentNft = {
  address: string;
  tokenId: string;
  lendingId: string;
  rentDuration: string;
  paymentToken: PaymentToken;
  amount: string;
};

export const useStartRent = (): {
  isApproved: boolean;
  startRent: (nfts: StartRentNft[]) => Promise<void | ContractTransaction>;
  handleApproveAll: () => void;
  checkApprovals: (nfts: StartRentNft[]) => void;
  isApprovalLoading: boolean;
} => {
  const [signer] = useContext(SignerContext);
  const { instance: resolver } = useContext(ResolverContext);
  const currentAddress = useContext(CurrentAddressWrapper);
  const [approvals, setApprovals] = useState<ERC20[]>();
  const [isApprovalLoading, setApprovalLoading] = useState<boolean>(true);
  const contractAddress = useContractAddress();
  const { setHash } = useContext(TransactionStateContext);

  const renft = useMemo(() => {
    if (!signer) return;
    return getReNFT(signer, contractAddress);
  }, [contractAddress, signer]);

  const checkApprovals = useCallback(
    (nfts: StartRentNft[]) => {
      if (!resolver) return;
      if (!currentAddress) return;
      if (!contractAddress) return;

      setApprovalLoading(true);

      const promiseTokenAddresses = getDistinctItems(nfts, 'paymentToken')
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
              .filter(([allowance]) => allowance.lt(MAX_UINT256))
              .map(([_, erc20]) => erc20);
            setApprovalLoading(false);
            setApprovals(approvals);
          }
        );
      });
    },
    [contractAddress, currentAddress, resolver, signer]
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
        //TODO this is wrong, all transactions needs to be tracked
      ).then(([tx]) => {
        if (tx) setHash(tx.hash);
        setApprovalLoading(false);
        setApprovals([]);
      });
    }
  }, [approvals, contractAddress, setHash]);

  const startRent = useCallback(
    async (nfts: StartRentNft[]) => {
      if (!renft) return Promise.resolve();

      const addresses = nfts.map((nft) => nft.address);
      const tokenIds = nfts.map((nft) => BigNumber.from(nft.tokenId));
      const lendingIds = nfts.map((nft) => BigNumber.from(nft.lendingId));
      const rentDurations = nfts.map((nft) => Number(nft.rentDuration));
      const amount = nfts.map((nft) => Number(nft.amount));

      debug("addresses", addresses);
      debug(
        "tokenIds",
        tokenIds.map((t) => t.toHexString())
      );
      debug(
        "lendingIds",
        lendingIds.map((t) => t.toHexString())
      );
      debug("rentDurations", rentDurations);

      return await renft
        .rent(addresses, tokenIds, amount, lendingIds, rentDurations)
        .catch((e) => {
          debug("Error with rent", e);
        });
    },
    [renft]
  );

  return {
    startRent,
    checkApprovals,
    handleApproveAll,
    isApproved,
    isApprovalLoading,
  };
};
