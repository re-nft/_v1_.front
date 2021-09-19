import React, { useCallback, useMemo } from "react";
import { Lending } from "../../../types/classes";
import Checkbox from "../../common/checkbox";
import { ShortenPopover } from "../../common/shorten-popover";
import { PaymentToken } from "@renft/sdk";
import { useNftMetaState } from "../../../hooks/store/useMetaState";
import shallow from "zustand/shallow";
import { useTimestamp } from "../../../hooks/misc/useTimestamp";

export const LendingRow: React.FC<{
  lending: Lending & { relended: boolean };
  checkBoxChangeWrapped: (lending: Lending) => () => void;
  checked: boolean;
  hasRenting: boolean;
  openClaimModal: (t: boolean) => void;
  openLendModal: (t: boolean) => void;
}> = ({ lending, checkBoxChangeWrapped, checked, hasRenting }) => {
  const blockTimeStamp = useTimestamp();
  const meta = useNftMetaState(
    useCallback(
      (state) => {
        return state.metas[lending.nId] || {};
      },
      [lending.nId]
    ),
    shallow
  );

  const claimable = useMemo(
    () =>
      !!(
        lending.hasRenting &&
        //TODO:eniko
        // isClaimable(lend.renting, blockTimeStamp) &&
        !lending.collateralClaimed
      ),
    [lending]
  );

  const formatCollateral = (v: number) => {
    const parts = v.toString().split(".");
    if (parts.length === 1) {
      return v.toString();
    }
    const wholePart = parts[0];
    const decimalPart = parts[1];
    return `${wholePart}.${decimalPart.substring(0, 4)}`;
  };

  const onRowClick = useCallback(() => {
    if (hasRenting && !claimable) return;
    checkBoxChangeWrapped(lending)();
  }, [checkBoxChangeWrapped, lending, hasRenting, claimable]);

  return (
    <tr
      onClick={onRowClick}
      className="transition-opacity duration-500
      ease-in-out text-2xl leading-rn-1 bg-white bg-opacity-0
      hover:bg-opacity-20 hover:cursor-pointer"
    >
      <td className="pl-8 px-1 whitespace-nowrap font-normal">
        <ShortenPopover longString={meta?.name || ""}></ShortenPopover>
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        <ShortenPopover longString={lending.nftAddress}></ShortenPopover>
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        <ShortenPopover longString={lending.tokenId}></ShortenPopover>
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {lending.lentAmount}
      </td>
      <td className="px-1  whitespace-nowrap font-normal">
        {PaymentToken[lending.paymentToken ?? 0]}
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {lending.maxRentDuration} {lending.maxRentDuration > 1 ? "days" : "day"}
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {formatCollateral(lending.nftPrice * Number(lending.lentAmount))}
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {lending.dailyRentPrice}
      </td>

      <td className="px-1 whitespace-nowrap font-normal">
        {lending.relended ? "renter" : "owner"}
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {claimable || lending.collateralClaimed ? "yes" : "no"}
      </td>

      <td className="pr-8 flex justify-end whitespace-nowrap font-normal">
        <Checkbox
          onChange={checkBoxChangeWrapped(lending)}
          checked={checked}
          disabled={hasRenting && !claimable}
          label="Select for lending"
          ariaLabel="Select for lending"
        />
      </td>
    </tr>
  );
};
