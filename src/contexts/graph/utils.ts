import { ethers } from "ethers";

import { LendingT, RentingT, LendingRaw, RentingRaw } from "./types";
import { DP18 } from "../../consts";
import { unpackPrice, parsePaymentToken } from "../../utils";

export const parseLending = (lending: LendingRaw): LendingT => {
  return {
    id: lending.id,
    nftAddress: ethers.utils.getAddress(lending.nftAddress),
    tokenId: lending.tokenId,
    amount: lending.lentAmount,
    lenderAddress: ethers.utils.getAddress(lending.lenderAddress),
    maxRentDuration: Number(lending.maxRentDuration),
    dailyRentPrice: unpackPrice(lending.dailyRentPrice, DP18),
    nftPrice: unpackPrice(lending.nftPrice, DP18),
    paymentToken: parsePaymentToken(lending.paymentToken),
    collateralClaimed: Boolean(lending.collateralClaimed),
    renting: lending.renting ?? undefined,
  };
};

export const parseRenting = (renting: RentingRaw): RentingT => {
  return {
    id: renting.id,
    renterAddress: ethers.utils.getAddress(renting.renterAddress),
    rentDuration: Number(renting.rentDuration),
    rentedAt: Number(renting.rentedAt),
    // @ts-ignore
    lendingId: renting.lending.id,
    lending: renting.lending,
  };
};
