import { ReNFT } from "../hardhat/typechain/ReNFT";
import { Signer, ContractTransaction, ethers } from "ethers";
import { PaymentToken } from "../types";
import { Lending } from "../contexts/graph/classes";
import { Resolver } from "../hardhat/typechain/Resolver";
import { getERC20 } from "../utils";
import { MAX_UINT256 } from "../consts";

export default async function startRent(
  renft: ReNFT,
  nft: Lending[],
  resolver: Resolver,
  currentAddress: string,
  signer: Signer,
  rentDurations: string[],
  pmtToken: PaymentToken
): Promise<ContractTransaction | undefined> {
  const amountPayable = nft.reduce((sum, item, index) => {
    const dailyRentPrice = item.lending.dailyRentPrice;
    const collateral = item.lending.nftPrice;
    sum += Number(rentDurations[index]) * dailyRentPrice + collateral;
    return sum;
  }, 0);

  const isETHPayment = pmtToken === PaymentToken.WETH;
  const addresses = nft.map((x) => x.address);
  const tokenIds = nft.map((x) => x.tokenId);
  const lendingIds = nft.map((x) => x.lending.id);
  const durations = rentDurations.map((x) => Number(x));

  // TODO: will fail
  const amounts = [1];

  if (isETHPayment) {
    return await renft.rent(
      addresses,
      tokenIds,
      amounts,
      lendingIds,
      durations
    );
  }

  const erc20Address = await resolver.getPaymentToken(pmtToken);

  if (!erc20Address) {
    console.warn("could not fetch address for payment token");
    return undefined;
  }
  const erc20 = getERC20(erc20Address, signer);

  if (!erc20) {
    console.warn("could not fetch erc20 contract");
    return undefined;
  }

  const allowance = await erc20.allowance(currentAddress, renft.address);

  const notEnough = ethers.utils
    .parseEther(String(amountPayable))
    .gt(allowance);

  if (notEnough) {
    await erc20.approve(renft.address, MAX_UINT256);
  }

  // TODO: will fail

  return await renft.rent(addresses, tokenIds, amounts, lendingIds, durations);
}
