import React from "react";

export type CatalogueItemRowProps = {
  text: string;
  value: React.ReactChild;
};

const CatalogueItemRow: React.FC<CatalogueItemRowProps> = ({ text, value }) => (
  <div className="nft__meta_row">
    <div className="nft__meta_title">{text}</div>
    <div className="nft__meta_dot"></div>
    <div className="nft__meta_value">{value}</div>
  </div>
);

export default React.memo(CatalogueItemRow);
