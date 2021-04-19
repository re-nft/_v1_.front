import React from "react";

export type NumericFieldProps = {
  text: string;
  value: string;
  unit?: string;
};

const NumericField: React.FC<NumericFieldProps> = ({ text, value, unit }) => (
  <div className="nft__meta_row">
    <div className="nft__meta_title">{text}</div>
    <div className="nft__meta_dot"></div>
    <div className="nft__meta_value">
      {value} {unit}
    </div>
  </div>
);

export default React.memo(NumericField);
