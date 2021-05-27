import { useCallback, useContext, useMemo } from "react";
import { ResolverContext, SignerContext } from "../hardhat/SymfoniContext";
import { PaymentToken } from "@renft/sdk";
import { getReNFT } from "../services/get-renft-instance";
import { BigNumber, ContractTransaction } from "ethers";
import createDebugger from "debug";
import { Resolver } from "../hardhat/typechain/Resolver";
import { getE20 } from "../utils";
import { MAX_UINT256 } from "../consts";
import { RENFT_ADDRESS } from "@renft/sdk";

// ENABLE with DEBUG=* or DEBUG=FETCH,Whatever,ThirdOption
const debug = createDebugger("app:contract");

export const useStartRent = (): ((
  nfts: {
    address: string;
    tokenId: string;
    amount: string;
    lendingId: string;
    rentDuration: string;
    paymentToken: PaymentToken;
  }[]
) => Promise<void | ContractTransaction>) => {
  const [signer] = useContext(SignerContext);
  const { instance: resolver } = useContext(ResolverContext);

  const renft = useMemo(() => {
    if (!signer) return;
    return getReNFT(signer);
  }, [signer]);

  const startRent = useCallback(
    async (
      nfts: {
        address: string;
        tokenId: string;
        amount: string;
        lendingId: string;
        rentDuration: string;
        paymentToken: PaymentToken;
      }[]
    ) => {
      if (!renft) return Promise.resolve();
      if (!signer) return;
      if (!resolver) return;

      const currentAddress = await signer.getAddress();
      const tokens = new Set<PaymentToken>();
      nfts.forEach((nft) => tokens.add(nft.paymentToken));
      const promiseTokenAddresses: Promise<string>[] = [];
      for (const token of tokens.values()) {
        promiseTokenAddresses.push(resolver.getPaymentToken(token));
      }
      const tokenAddresses: string[] = await Promise.all(promiseTokenAddresses);
      const erc20s = tokenAddresses.map((addr) => getE20(addr, signer));
      const promiseTokenAllowances: Promise<BigNumber>[] = tokenAddresses.map(
        (_, ix) => erc20s[ix].allowance(currentAddress, RENFT_ADDRESS)
      );
      const tokenAllowances: BigNumber[] = await Promise.all(
        promiseTokenAllowances
      );
      const promiseApprovals: Promise<ContractTransaction>[] = [];
      tokenAllowances.forEach((allowance, ix) => {
        if (allowance.lt(MAX_UINT256)) {
          promiseApprovals.push(erc20s[ix].approve(RENFT_ADDRESS, MAX_UINT256));
        }
      });
      // this invokes approvals on all the tokens
      await Promise.all(promiseApprovals);

      return await renft.rent(
        nfts.map((nft) => nft.address),
        nfts.map((nft) => BigNumber.from(nft.tokenId)),
        nfts.map((nft) => Number(nft.amount)),
        nfts.map((nft) => BigNumber.from(nft.lendingId)),
        nfts.map((nft) => Number(nft.rentDuration))
      );
    },
    [renft, signer, resolver]
  );
  return startRent;
};
