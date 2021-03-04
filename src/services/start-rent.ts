import { RentNft } from "../hardhat/typechain/RentNft";
import { Signer } from "ethers";
import { ethers } from "ethers";
import { PaymentToken } from "../types";
import { Nft, Lending } from "../contexts/graph/classes";
import { Resolver } from "../hardhat/typechain/Resolver";
import { getERC20 } from "../utils";
import { MAX_UINT256 } from "../consts";

export default async function startRent(
  renft: RentNft,
  nft: Lending[],
  resolver: Resolver,
  currentAddress: string,
  signer: Signer,
  rentDurations: string[],
  pmtToken: PaymentToken
): Promise<void> {
  const amountPayable = nft.reduce((sum, item, index) => {
    const dailyRentPrice = item.lending.dailyRentPrice;
    const collateral = item.lending.nftPrice;
    sum += Number(rentDurations[index]) * dailyRentPrice + collateral;
    return sum;
  }, 0);

  const isETHPayment = pmtToken === PaymentToken.ETH;
  const addresses = nft.map((x) => x.address);
  const tokenIds = nft.map((x) => x.tokenId);
  const lendingIds = nft.map((x) => 0);
  const durations = rentDurations.map((x) => Number(x));

  if (isETHPayment) {
    await renft.rent(addresses, tokenIds, lendingIds, durations, {
      value: amountPayable,
    });
  } else {
    const erc20Address = await resolver.getPaymentToken(pmtToken);

    if (!erc20Address) {
      console.warn("could not fetch address for payment token");
      return;
    }
    const erc20 = getERC20(erc20Address, signer);

    if (!erc20) {
      console.warn("could not fetch erc20 contract");
      return;
    }

    const allowance = await erc20.allowance(currentAddress, renft.address);

    const notEnough = ethers.utils
      .parseEther(String(amountPayable))
      .gt(allowance);

    if (notEnough) {
      await erc20.approve(renft.address, MAX_UINT256);
    }

    await renft.rent(addresses, tokenIds, lendingIds, durations);
  }
}
