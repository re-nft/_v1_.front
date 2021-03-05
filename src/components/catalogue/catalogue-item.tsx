import React, { useState, useEffect } from "react";
import { Checkbox } from "@material-ui/core";
import { Nft } from "../../contexts/graph/classes";

export type CatalogueItemProps = {
  nft: Nft;
  checked?: boolean;
  // When Catalog Item have a multi-select we need to pass onCheckboxChange callback func
  onCheckboxChange?: (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
};

const CatalogueItem: React.FC<CatalogueItemProps> = ({
  nft,
  checked,
  onCheckboxChange,
  children,
}) => {
  const [img, setImg] = useState<string>();
  const loadMediaURI = async () => {
    const mediaURI = await nft.mediaURI();
    return mediaURI;
  };
  useEffect(() => {
    loadMediaURI()
      .then((mediaUri) => setImg(mediaUri))
      .catch(() => "");
    /* eslint-disable-next-line */
  }, []);

  return (
    <div className="Nft__item" key={nft.tokenId}>
      {onCheckboxChange && (
        <div className="Nft__checkbox">
          <Checkbox
            name={nft.tokenId}
            checked={checked}
            onChange={onCheckboxChange}
            inputProps={{ "aria-label": "primary checkbox" }}
          />
        </div>
      )}
      <div className="Nft" data-item-id={nft.tokenId}>
        <div className="Nft__image">
          {img && <img loading="lazy" src={img} />}
        </div>
        {nft.name && nft.name.trim() !== "" && (
          <div className="Nft__card">
            <p style={{ fontWeight: 600 }}>{nft.name}</p>
          </div>
        )}
        <div className="Nft__card">
          <p className="Nft__text_overflow">
            <a
              href={`https://goerli.etherscan.io/address/${nft.address}`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none", color: "black" }}
            >
              {nft.address}
            </a>
          </p>
        </div>
        <div className="Nft__card">
          <p className="Nft__text_overflow">
            <span className="Nft__label">Token id</span>
            <span className="Nft__value">{nft.tokenId}</span>
          </p>
        </div>
        {/* description fields */}
        {children}
      </div>
    </div>
  );
};

export default CatalogueItem;
