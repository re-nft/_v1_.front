import { useCallback, useContext, useMemo, useState, useEffect } from "react";
import { PaymentToken } from "@renft/sdk";
import { getReNFT } from "../services/get-renft-instance";
import { BigNumber } from "ethers";
import { getE20 } from "../utils";
import {  MAX_UINT256 } from "../consts";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import createDebugger from "debug";
import { ERC20 } from "../hardhat/typechain/ERC20";
import {
  ProviderContext,
  ResolverContext,
  SignerContext,
} from "../hardhat/SymfoniContext";
import { useContractAddress } from "../contexts/StateProvider";

const debug = createDebugger("app:contract:startRent");

type SimpleNft = {
  address: string;
  tokenId: string;
  lendingId: string;
  rentDuration: string;
  paymentToken: PaymentToken;
  amount: string;
};

export const useStartRent = (
  nfts: SimpleNft[]
): {
  isApproved: boolean;
  startRent: () => void;
  handleApproveAll: () => void;
} => {
  const [signer] = useContext(SignerContext);
  const { instance: resolver } = useContext(ResolverContext);
  const currentAddress = useContext(CurrentAddressWrapper);
  const [approvals, setApprovals] = useState<ERC20[]>();
  const [isApproved, setApproved] = useState(false);
  const contractAddress = useContractAddress()

  const renft = useMemo(() => {
    if (!signer) return;
    return getReNFT(signer, contractAddress);
  }, [contractAddress, signer]);

  useEffect(() => {
    if (!resolver) return;
    if (!currentAddress) return;
    if(!contractAddress) return;

    const tokens = new Set<PaymentToken>();
    nfts.forEach((nft) => tokens.add(nft.paymentToken));
    const promiseTokenAddresses: Promise<string>[] = [];
    for (const token of tokens.values()) {
      promiseTokenAddresses.push(resolver.getPaymentToken(token));
    }
    setApproved(false);
    Promise.all(promiseTokenAddresses).then((tokenAddresses) => {
      const erc20s = tokenAddresses.map((addr) => getE20(addr, signer));

      const promiseTokenAllowances: Promise<BigNumber>[] = erc20s.map((erc20) =>
        erc20.allowance(currentAddress, contractAddress)
      );
      return Promise.all(promiseTokenAllowances).then(
        (tokenAllowances: BigNumber[]) => {
          const approvals: ERC20[] = tokenAllowances
            .filter((allowance, ix) => allowance.lt(MAX_UINT256))
            .map((allowance, ix) => {
              return erc20s[ix];
            });
          setApprovals(approvals);
          if (approvals.length < 1) setApproved(true);
        }
      );
    });
  }, [contractAddress, currentAddress, nfts, resolver, signer]);

  const handleApproveAll = useCallback(() => {
    if (!isApproved && approvals && approvals.length > 0) {
      Promise.all(
        approvals.map((approval) =>
          approval.approve(contractAddress, MAX_UINT256)
        )
      ).then(() => {
        setApproved(true);
      });
    }
  }, [approvals, contractAddress, isApproved]);

  const startRent = useCallback(async () => {
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
  }, [nfts, renft]);

  return {
    startRent,
    handleApproveAll,
    isApproved,
  };
};
