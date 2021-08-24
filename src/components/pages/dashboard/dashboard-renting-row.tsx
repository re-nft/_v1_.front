import moment from "moment";
import React, { useCallback } from "react";
import { Renting } from "../../../contexts/graph/classes";
import Checkbox from "../../common/checkbox";
import { PaymentToken } from "@renft/sdk";
import { CountDown } from "../../common/countdown";
import { Tooltip } from "../../common/tooltip";
import { Button } from "../../common/button";
import { ShortenPopover } from "../../common/shorten-popover";

export const RentingRow: React.FC<{
  checked: boolean;
  rent: Renting & { relended: boolean };
  openModal: (t: boolean) => void;
  currentAddress: string;
  checkBoxChangeWrapped: (nft: Renting) => () => void;
  isExpired: boolean;
}> = ({
  checked,
  rent,
  checkBoxChangeWrapped,
  currentAddress,
  isExpired,
  openModal,
}) => {
  const renting = rent.renting;
  const handleClick = useCallback(() => {
    checkBoxChangeWrapped(rent)();
    openModal(true);
  }, [checkBoxChangeWrapped, openModal, rent]);

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
  let tooltip = "Return NFT";
  tooltip = isExpired
    ? "The NFT is expired. You cannot return it anymore."
    : tooltip;
  tooltip = rent.relended
    ? "Please stop lending this item first. Then you can return it!"
    : tooltip;
  return (
    <tr onClick={handleRowClicked}>
      <td className="px-6 py-4 whitespace-nowrap">
        <Checkbox
          onChange={checkBoxChangeWrapped(rent)}
          checked={checked}
          disabled={isExpired || rent.relended}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <ShortenPopover
          longString={renting.lending.nftAddress}
        ></ShortenPopover>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <ShortenPopover longString={rent.tokenId}></ShortenPopover>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {renting.lending.lentAmount}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {PaymentToken[renting.lending.paymentToken ?? 0]}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {formatCollateral(
          renting.lending.nftPrice * Number(renting.lending.lentAmount)
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {renting.lending.dailyRentPrice}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {days} {days > 1 ? "days" : "day"}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        {moment(Number(renting.rentedAt) * 1000).format("MM/D/YY hh:mm")}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <CountDown endTime={expireDate.toDate().getTime()} />
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        {renting.lending.lenderAddress !== currentAddress.toLowerCase() && (
          <Tooltip title={tooltip} aria-label={tooltip}>
            <span>
              <Button
                onClick={handleClick}
                disabled={checked || isExpired || rent.relended}
                description="Return it"
              />
            </span>
          </Tooltip>
        )}
      </td>
    </tr>
  );
};
