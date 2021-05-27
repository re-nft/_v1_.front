import { useCallback, useContext, useMemo, useState, useEffect } from "react";
import { ResolverContext, SignerContext } from "../hardhat/SymfoniContext";
import { PaymentToken } from "@renft/sdk";
import { getReNFT } from "../services/get-renft-instance";
import { BigNumber, ContractTransaction } from "ethers";
import { getE20 } from "../utils";
import { CONTRACT_ADDRESS, IS_PROD, MAX_UINT256 } from "../consts";
import { CurrentAddressContextWrapper } from "../contexts/CurrentAddressContextWrapper";
import createDebugger from "debug";
import { ERC20 } from "../hardhat/typechain/ERC20";

const debug = createDebugger("app:contract:startRent");

type SimpleNft = {
  address: string;
  tokenId: string;
  amount: string;
  lendingId: string;
  rentDuration: string;
  paymentToken: PaymentToken;
};

export const useStartRent = (
  nfts: SimpleNft[]
): {
  isApproved: boolean;
  startRent: () => void;
  handleApproveAll: () => void;
} => {
  const [signer] = useContext(SignerContext);
  const [currentAddress] = useContext(CurrentAddressContextWrapper);
  const { instance: resolver } = useContext(ResolverContext);
  const [approvals, setApprovals] = useState<ERC20[]>();
  const [isApproved, setApproved] = useState(false);

  const renft = useMemo(() => {
    if (!signer) return;
    return getReNFT(signer);
  }, [signer]);

  useEffect(() => {
    if (!resolver) return;
    if (!CONTRACT_ADDRESS)
      throw new Error(
        `Please specify contract address for ${process.env.REACT_APP_ENVIRONMENT}`
      );
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
        erc20.allowance(currentAddress, CONTRACT_ADDRESS as string)
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
  }, [currentAddress, nfts, resolver, signer]);

  const handleApproveAll = useCallback(() => {
    if (!isApproved && approvals && approvals.length > 0) {
      Promise.all(
        approvals.map((approval) =>
          approval.approve(CONTRACT_ADDRESS as string, MAX_UINT256)
        )
      ).then(() => {
        setApproved(true);
      });
    }
  }, [approvals, isApproved]);

  const startRent = useCallback(async () => {
    if (!renft) return Promise.resolve();

    const addresses = nfts.map((nft) => nft.address);
    const tokenIds = nfts.map((nft) => BigNumber.from(nft.tokenId));
    const amounts = nfts.map((nft) => Number(nft.amount));
    const lendingIds = nfts.map((nft) => BigNumber.from(nft.lendingId));
    const rentDurations = nfts.map((nft) => Number(nft.rentDuration));

    debug("addresses", addresses);
    debug("amounts", amounts);
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
      .rent(addresses, tokenIds, amounts, lendingIds, rentDurations)
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
