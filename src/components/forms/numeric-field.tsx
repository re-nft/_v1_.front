import React, { useContext, useCallback } from "react";
import { Box, Tooltip } from "@material-ui/core";

export type NumericFieldProps = {
  text: string;
  value: string;
  unit?: string;
};

// ! this number conversion may fail if non-number is passed
// but since it comes out of blockchain, this should always be correct
const NumericField: React.FC<NumericFieldProps> = ({ text, value, unit }) => (
  <div className="Nft__card">
    <p className="Nft__text_overflow">
      <span className="Nft__label">{text}</span>
      <Tooltip title={value}>
        <span className="Nft__value">{`${unit} ${Number(value).toFixed(
          2
        )}`}</span>
      </Tooltip>
    </p>
  </div>
);

export default NumericField;
