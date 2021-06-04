import { ethers } from "ethers";

import { ILending, IRenting, LendingRaw, RentingRaw } from "./types";
import { DP18, DP9 } from "../../consts";
import { unpackPrice, parsePaymentToken } from "../../utils";
import { PaymentToken } from "../../types";

export const parseLending = (
  lending: LendingRaw,
  parsedRenting?: IRenting
): ILending => {
  const paymentToken = parsePaymentToken(lending.paymentToken);
  const number =
    paymentToken === PaymentToken.USDC || paymentToken === PaymentToken.USDT
      ? DP9
      : DP18;
  const precision =
    paymentToken === PaymentToken.USDC || paymentToken === PaymentToken.USDT
      ? 10e9
      : 10e18;
  return {
    id: lending.id,
    nftAddress: ethers.utils.getAddress(lending.nftAddress),
    tokenId: lending.tokenId,
    lentAmount: lending.lentAmount,
    lenderAddress: ethers.utils.getAddress(lending.lenderAddress),
    maxRentDuration: Number(lending.maxRentDuration),
    dailyRentPrice: unpackPrice(lending.dailyRentPrice, number, precision),
    nftPrice: unpackPrice(lending.nftPrice, number, precision),
    paymentToken: parsePaymentToken(lending.paymentToken),
    collateralClaimed: Boolean(lending.collateralClaimed),
    isERC721: lending.isERC721,
    renting: parsedRenting,
  };
};

export const parseRenting = (
  renting: RentingRaw,
  parsedLending: ILending
): IRenting => {
  return {
    id: renting.id,
    renterAddress: ethers.utils.getAddress(renting.renterAddress),
    rentDuration: Number(renting.rentDuration),
    rentedAt: Number(renting.rentedAt),
    lendingId: parsedLending.id,
    lending: parsedLending,
  };
};
