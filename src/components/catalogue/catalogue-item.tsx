import React from "react";
import { Checkbox } from "@material-ui/core";

export type CatalogueItemProps = {
  tokenId: string;
  nftAddress: string;
  mediaURI?: string;
  // When Catalog Item have a multi-select we need to pass onCheckboxChange callback func
  onCheckboxChange?: (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
};

const CatalogueItem: React.FC<CatalogueItemProps> = ({
  tokenId,
  nftAddress,
  mediaURI,
  onCheckboxChange,
  children,
}) => {
  return (
    <div className="Nft__item" key={tokenId}>
      {onCheckboxChange && (
        <div className="Nft__checkbox">
          <Checkbox
            name={tokenId}
            onChange={onCheckboxChange}
            inputProps={{ "aria-label": "primary checkbox" }}
          />
        </div>
      )}
      <div className="Nft" data-item-id={tokenId}>
        <div className="Nft__image">{mediaURI ?? ""}</div>
        <div className="Nft__card">
          <p className="Nft__text_overflow">
            <a
              href={`https://goerli.etherscan.io/address/${nftAddress}`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none", color: "black" }}
            >
              {nftAddress}
            </a>
          </p>
        </div>
        <div className="Nft__card">
          <p className="Nft__text_overflow">
            <span className="Nft__label">Token id</span>
            <span className="Nft__value">{tokenId}</span>
          </p>
        </div>
        {/* description fields */}
        {children}
      </div>
    </div>
  );
};

export default CatalogueItem;
