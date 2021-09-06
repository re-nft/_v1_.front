import React from "react";
import { Lending } from "../types/classes";
import { PaymentToken } from "@renft/sdk";
import { CatalogueItemRow } from "./catalogue-item/catalogue-item-row";

const LendingFields: React.FC<{ nft: Lending }> = ({ nft }) => {
  const days = parseInt(String(nft.lending.maxRentDuration), 10);
  return (
    <>
      <CatalogueItemRow
        text={`Daily price [${PaymentToken[nft.lending.paymentToken]}]`}
        value={nft.lending.dailyRentPrice.toString()}
      />
      <CatalogueItemRow
        text={`Max duration [${days > 1 ? "days" : "day"}]`}
        value={days.toString()}
      />
      <CatalogueItemRow
        text={`Collateral [${PaymentToken[nft.lending.paymentToken]}]`}
        value={nft.lending.nftPrice.toString()}
      />
    </>
  );
};

export default LendingFields;
