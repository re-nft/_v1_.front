import React from "react";
import { PaymentToken } from "@renft/sdk";
import { CatalogueItemRow } from "renft-front/components/catalogue-item/catalogue-item-row";

import type { Lending } from "renft-front/types/classes";

const LendingFields: React.FC<{ lending: Lending }> = ({ lending }) => {
  const days = parseInt(String(lending.maxRentDuration), 10);
  return (
    <>
      <CatalogueItemRow
        text={`Price/day [${PaymentToken[lending.paymentToken]}]`}
        value={lending.dailyRentPrice.toString()}
      />
      <CatalogueItemRow
        text={`Max duration [${days > 1 ? "days" : "day"}]`}
        value={days.toString()}
      />
      <CatalogueItemRow
        text={`Collateral [${PaymentToken[lending.paymentToken]}]`}
        value={lending.nftPrice.toString()}
      />
    </>
  );
};

export default LendingFields;
