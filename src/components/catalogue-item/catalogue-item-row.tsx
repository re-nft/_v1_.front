import React from "react";

export type CatalogueItemRowProps = {
  text: string;
  value: React.ReactChild;
};

//TODO shortenpopover
export const CatalogueItemRow: React.FC<CatalogueItemRowProps> = ({
  text,
  value,
}) => (
  <div className="w-full flex font-body text-xl leading-rn-1">
    <div className="flex-initial">{text}</div>
    <div className="flex-auto border-b-2 border-dotted border-black font-display"></div>
    <div className="flex-initial">{value}</div>
  </div>
);
