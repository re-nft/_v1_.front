import { ReNFT, RENFT_ADDRESS } from "@renft/sdk";
import { Signer, ContractTransaction, BigNumber } from "ethers";
import { PaymentToken } from "../types";
import { Resolver } from "../hardhat/typechain/Resolver";
import { getE20 } from "../utils";
import { MAX_UINT256 } from "../consts";

export default async function startRent(
  signer: Signer,
  resolver: Resolver,
  nfts: {
    address: string;
    tokenId: string;
    amount: string;
    lendingId: string;
    rentDuration: string;
    paymentToken: PaymentToken;
  }[]
): Promise<ContractTransaction | undefined> {
  // TODO: need to abstract this code away, perhaps add the util function to the sdk!
  // TODO: because this needs to be called in the lend function as well
  const currentAddress = await signer.getAddress();
  const tokens = new Set<PaymentToken>();
  nfts.forEach((nft) => tokens.add(nft.paymentToken))
  const promiseTokenAddresses: Promise<string>[] = [];
  for (const token of tokens.values()) {
    promiseTokenAddresses.push(resolver.getPaymentToken(token));
  }
  const tokenAddresses: string[] = await Promise.all(promiseTokenAddresses);
  const erc20s = tokenAddresses.map((addr) => getE20(addr, signer));
  const promiseTokenAllowances: Promise<BigNumber>[] = tokenAddresses.map((_, ix) => erc20s[ix].allowance(currentAddress, RENFT_ADDRESS));
  const tokenAllowances: BigNumber[] = await Promise.all(promiseTokenAllowances);
  const promiseApprovals: Promise<ContractTransaction>[] = [];
  tokenAllowances.forEach((allowance, ix) => {
    if (allowance.lt(MAX_UINT256)) {
      promiseApprovals.push(erc20s[ix].approve(RENFT_ADDRESS, MAX_UINT256));
    }
  });
  // this invokes approvals on all the tokens
  await Promise.all(promiseApprovals);

  return await new ReNFT(signer).rent(
    nfts.map((nft) => (nft.address)),
    nfts.map((nft) => (BigNumber.from(nft.tokenId))),
    nfts.map((nft) => (Number(nft.amount))),
    nfts.map((nft) => (BigNumber.from(nft.lendingId))),
    nfts.map((nft) => (Number(nft.rentDuration)))
  );
}
