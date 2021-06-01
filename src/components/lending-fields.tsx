import React from "react";
import NumericField from "./numeric-field";
import { PaymentToken } from "../types";
import { Lending } from "../contexts/graph/classes";

const LendingFields: React.FC<{ nft: Lending }> = ({ nft }) => {
  return (
    <>
      <NumericField
        text="Daily price"
        value={nft.lending.dailyRentPrice.toString()}
        unit={PaymentToken[nft.lending.paymentToken]}
      />
      <NumericField
        text="Max duration"
        value={String(parseInt(String(nft.lending.maxRentDuration), 10))}
        unit="days"
      />
      <NumericField
        text="Collateral"
        value={nft.lending.nftPrice.toString()}
        unit={PaymentToken[nft.lending.paymentToken]}
      />
    </>
  );
};

export default LendingFields;
