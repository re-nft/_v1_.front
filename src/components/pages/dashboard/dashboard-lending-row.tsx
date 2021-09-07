import React, { useCallback, useMemo } from "react";
import { Lending, Nft } from "../../../types/classes";
import { isClaimable } from "../../../hooks/useBatchItems";
import Checkbox from "../../common/checkbox";
import { ShortenPopover } from "../../common/shorten-popover";
import { PaymentToken } from "@renft/sdk";
import { useNftMetaState } from "../../../hooks/queries/useMetaState";
import shallow from "zustand/shallow";
import { useTimestamp } from "../../../hooks/useTimestamp";

export const LendingRow: React.FC<{
  lend: Lending & { relended: boolean };
  checkBoxChangeWrapped: (nft: Nft) => () => void;
  checked: boolean;
  hasRenting: boolean;
  openClaimModal: (t: boolean) => void;
  openLendModal: (t: boolean) => void;
}> = ({ lend, checkBoxChangeWrapped, checked, hasRenting }) => {
  const lending = lend.lending;
  const blockTimeStamp = useTimestamp();
  const meta = useNftMetaState(
    useCallback(
      (state) => {
        return state.metas[lend.nId] || {};
      },
      [lend.nId]
    ),
    shallow
  );

  const claimable = useMemo(
    () =>
      !!(
        lend.renting &&
        isClaimable(lend.renting, blockTimeStamp) &&
        !lend.lending.collateralClaimed
      ),
    [lend, blockTimeStamp]
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
    checkBoxChangeWrapped(lend)();
  }, [checkBoxChangeWrapped, lend, hasRenting, claimable]);

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
      <td className="px-1 whitespace-nowrap font-normal">{lend.amount}</td>
      <td className="px-1  whitespace-nowrap font-normal">
        {PaymentToken[lending.paymentToken ?? 0]}
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {lending.maxRentDuration} {lending.maxRentDuration > 1 ? "days" : "day"}
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {formatCollateral(lending.nftPrice * Number(lend.amount))}
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {lending.dailyRentPrice}
      </td>

      <td className="px-1 whitespace-nowrap font-normal">
        {lend.relended ? "renter" : "owner"}
      </td>
      <td className="px-1 whitespace-nowrap font-normal">
        {claimable || lend.lending?.collateralClaimed ? "yes" : "no"}
      </td>

      <td className="pr-8 flex justify-end whitespace-nowrap font-normal">
        <Checkbox
          onChange={checkBoxChangeWrapped(lend)}
          checked={checked}
          disabled={hasRenting && !claimable}
        />
      </td>
    </tr>
  );
};
