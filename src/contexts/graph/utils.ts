import { ethers } from "ethers";

import { Lending, Renting, LendingRaw, RentingRaw } from "./types";
import { DP18 } from "../../consts";
import { unpackPrice, parsePaymentToken } from "../../utils";

export const parseLending = (lending: LendingRaw): Lending => {
  return {
    id: lending.id,
    nftAddress: ethers.utils.getAddress(lending.nftAddress),
    tokenId: lending.tokenId,
    lenderAddress: ethers.utils.getAddress(lending.lenderAddress),
    maxRentDuration: Number(lending.maxRentDuration),
    dailyRentPrice: unpackPrice(lending.dailyRentPrice, DP18),
    nftPrice: unpackPrice(lending.nftPrice, DP18),
    paymentToken: parsePaymentToken(lending.paymentToken),
    collateralClaimed: Boolean(lending.collateralClaimed),
    rentingId: lending.rentingId ?? undefined,
  };
};

export const parseRenting = (renting: RentingRaw): Renting => {
  return {
    id: renting.id,
    renterAddress: ethers.utils.getAddress(renting.renterAddress),
    rentDuration: Number(renting.rentDuration),
    rentedAt: Number(renting.rentedAt),
    lendingId: renting.lendingId,
  };
};
