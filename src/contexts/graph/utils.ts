import { ethers } from "ethers";
import { ILending, IRenting, LendingRaw, RentingRaw } from "./types";
//@ts-ignore
import { unpackPrice } from "@eenagy/sdk";
import { parsePaymentToken } from "../../utils";

export const parseLending = (
  lending: LendingRaw,
  parsedRenting?: IRenting
): ILending => {
  return {
    id: lending.id,
    nftAddress: ethers.utils.getAddress(lending.nftAddress),
    tokenId: lending.tokenID,
    lentAmount: lending.lendAmount,
    lenderAddress: ethers.utils.getAddress(lending.lenderAddress),
    maxRentDuration: Number(lending.maxRentDuration),
    dailyRentPrice: unpackPrice(lending.dailyRentPrice),
    paymentToken: parsePaymentToken(lending.paymentToken),
    rentClaimed: Boolean(lending.rentClaimed),
    is721: lending.is721,
    renting: parsedRenting,
    lentAt: Number(lending.lentAt)
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
    expired: renting.expired
  };
};
