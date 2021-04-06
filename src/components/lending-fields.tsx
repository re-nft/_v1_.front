import React from "react";
import NumericField from "./numeric-field";
import { PaymentToken } from "../types";
import { getLendingPriceByCurreny } from "../utils";
import { Lending } from "../contexts/graph/classes";

const LendingFields: React.FC<{ nft: Lending }> = ({ nft }) => {
  return (
    <>
      <NumericField
        text="Daily price"
        value={getLendingPriceByCurreny(
          nft.lending.dailyRentPrice,
          nft.lending.paymentToken
        )}
        unit={PaymentToken[nft.lending.paymentToken]}
      />
      <NumericField
        text="Max duration"
        value={String(parseInt(String(nft.lending.maxRentDuration), 10))}
        unit="days"
      />
      <NumericField
        text="Collateral"
        value={getLendingPriceByCurreny(
          nft.lending.nftPrice,
          nft.lending.paymentToken
        )}
        unit={PaymentToken[nft.lending.paymentToken]}
      />
    </>
  );
};

export default LendingFields;
