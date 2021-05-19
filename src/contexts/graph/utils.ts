import { ethers } from "ethers";

import { ILending, IRenting, LendingRaw, RentingRaw } from "./types";
import { DP18 } from "../../consts";
import { unpackPrice, parsePaymentToken } from "../../utils";

export const parseLending = (
  lending: LendingRaw,
  parsedRenting?: IRenting
): ILending => {
  return {
    id: lending.id,
    nftAddress: ethers.utils.getAddress(lending.nftAddress),
    tokenId: lending.tokenId,
    lentAmount: lending.lentAmount,
    lenderAddress: ethers.utils.getAddress(lending.lenderAddress),
    maxRentDuration: Number(lending.maxRentDuration),
    dailyRentPrice: unpackPrice(lending.dailyRentPrice, DP18),
    nftPrice: unpackPrice(lending.nftPrice, DP18),
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
