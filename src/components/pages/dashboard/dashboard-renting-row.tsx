import React, { useCallback } from "react";
import { Renting } from "../../../types/classes";
import Checkbox from "../../common/checkbox";
import { PaymentToken } from "@renft/sdk";
import { CountDown } from "../../common/countdown";
import { ShortenPopover } from "../../common/shorten-popover";
import { useNftMetaState } from "../../../hooks/store/useMetaState";
import shallow from "zustand/shallow";
import add from "date-fns/add";

export const RentingRow: React.FC<{
  checked: boolean;
  renting: Renting & { relended: boolean };
  currentAddress: string;
  checkBoxChangeWrapped: (nft: Renting) => () => void;
  isExpired: boolean;
}> = ({ checked, renting, checkBoxChangeWrapped, isExpired }) => {
  const meta = useNftMetaState(
    useCallback(
      (state) => {
        return state.metas[renting.nId] || {};
      },
      [renting.nId]
    ),
    shallow
  );

  const handleRowClicked = useCallback(() => {
    if (isExpired || renting.relended) return;
    checkBoxChangeWrapped(renting)();
  }, [checkBoxChangeWrapped, renting, isExpired]);
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

  const expireDate = add(new Date(renting.rentedAt * 1000), {
    days: renting.rentDuration,
  });

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
          longString={renting.nftAddress}
        ></ShortenPopover>
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        <ShortenPopover longString={renting.tokenId}></ShortenPopover>
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {renting.rentAmount}
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {PaymentToken[renting.paymentToken ?? 0]}
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {days} {days > 1 ? "days" : "day"}
      </td>

      <td className="px-1 whitespace-nowrap font-normal">
        {formatCollateral(
          renting.nftPrice * Number(renting.rentAmount)
        )}
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {renting.dailyRentPrice}
      </td>

      <td className="px-1 whitespace-nowrap font-normal">
        <CountDown endTime={expireDate.getTime()} />
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {isExpired ? "yes" : "no"}
      </td>

      <td className="pr-8 flex justify-end whitespace-nowrap font-normal">
        <Checkbox
          onChange={checkBoxChangeWrapped(renting)}
          checked={checked}
          disabled={isExpired || renting.relended}
          label='Select for renting'
          ariaLabel='Select for renting'
        />
      </td>
    </tr>
  );
};
