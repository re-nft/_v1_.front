import moment from "moment";
import React, { useCallback } from "react";
import { Renting } from "../../../contexts/graph/classes";
import Checkbox from "../../common/checkbox";
import { PaymentToken } from "@renft/sdk";
import { CountDown } from "../../common/countdown";
import { ShortenPopover } from "../../common/shorten-popover";
import { useNftMetaState } from "../../../hooks/useMetaState";
import shallow from "zustand/shallow";

export const RentingRow: React.FC<{
  checked: boolean;
  rent: Renting & { relended: boolean };
  openModal: (t: boolean) => void;
  currentAddress: string;
  checkBoxChangeWrapped: (nft: Renting) => () => void;
  isExpired: boolean;
}> = ({ checked, rent, checkBoxChangeWrapped, isExpired, openModal }) => {
  const renting = rent.renting;
  const meta = useNftMetaState(
    useCallback(
      (state) => {
        return state.metas[rent.nId] || {};
      },
      [rent.nId]
    ),
    shallow
  );

  const handleRowClicked = useCallback(() => {
    if (isExpired || rent.relended) return;
    checkBoxChangeWrapped(rent)();
  }, [checkBoxChangeWrapped, rent, isExpired]);
  const days = renting.rentDuration;

  const formatCollateral = (v: number) => {
    const parts = v.toString().split(".");
    if (parts.length === 1) {
      return v.toString();
    }
    const wholePart = parts[0];
    const decimalPart = parts[1];
    return `${wholePart}.${decimalPart.substring(0, 4)}`;
  };

  const expireDate = moment(Number(renting.rentedAt) * 1000).add(
    renting.rentDuration,
    "day"
  );

  return (
    <tr
      onClick={handleRowClicked}
      className="transition-opacity duration-500
      ease-in-out text-2xl leading-rn-1 bg-white bg-opacity-0
      hover:bg-opacity-20 hover:cursor-pointer"
    >
      <td className="pl-8 px-1 whitespace-nowrap font-normal">
        <ShortenPopover longString={meta?.name || ""}></ShortenPopover>
      </td>

      <td className="px-1 whitespace-nowrap font-normal">
        <ShortenPopover
          longString={renting.lending.nftAddress}
        ></ShortenPopover>
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        <ShortenPopover longString={rent.tokenId}></ShortenPopover>
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {renting.lending.lentAmount}
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {PaymentToken[renting.lending.paymentToken ?? 0]}
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {days} {days > 1 ? "days" : "day"}
      </td>

      <td className="px-1 whitespace-nowrap font-normal">
        {formatCollateral(
          renting.lending.nftPrice * Number(renting.lending.lentAmount)
        )}
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {renting.lending.dailyRentPrice}
      </td>

      <td className="px-1 whitespace-nowrap font-normal">
        <CountDown endTime={expireDate.toDate().getTime()} />
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {isExpired ? "yes" : "no"}
      </td>

      <td className="pr-8 flex justify-end whitespace-nowrap font-normal">
        <Checkbox
          onChange={checkBoxChangeWrapped(rent)}
          checked={checked}
          disabled={isExpired || rent.relended}
        />
      </td>
    </tr>
  );
};
