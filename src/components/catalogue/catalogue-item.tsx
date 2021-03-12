import React, { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@material-ui/core";
import { Nft } from "../../contexts/graph/classes";

export type CatalogueItemProps = {
  nft: Nft;
  checked?: boolean;
  // When Catalog Item have a multi-select we need to pass onCheckboxChange callback func
  onCheckboxChange?: (name: string, checked: boolean) => void;
};

const CatalogueItem: React.FC<CatalogueItemProps> = ({
  nft,
  checked,
  onCheckboxChange,
  children,
}) => {
  const [img, setImg] = useState<string>();
  const [isChecked, setIsChecked] = useState<boolean>(checked || false);
  const loadMediaURI = async () => {
    const mediaURI = await nft.mediaURI();
    return mediaURI;
  };
  const onCheckboxClick = useCallback(() => {
    setIsChecked(!isChecked);
    onCheckboxChange && onCheckboxChange(`${nft.address}::${nft.tokenId}`, !isChecked);
  }, [nft, isChecked]);
  
  useEffect(() => {
    setIsChecked(checked || false);
  }, [checked]);

  useEffect(() => {
    loadMediaURI()
      .then((mediaUri) => setImg(mediaUri))
      .catch(() => "");
    /* eslint-disable-next-line */
  }, []);

  return (
    <div className="nft" key={nft.tokenId} data-item-id={nft.tokenId}>
      {onCheckboxChange && (
        <div className="nft__checkbox">
          <div onClick={onCheckboxClick} className={`checkbox ${isChecked ? 'checked' : ''}`}></div>
        </div>
      )}
      <div className="nft__image">
          {img ? <img loading="lazy" src={img} /> : <div className="no-img">NO IMG</div>}
      </div>
      <div className="nft__meta"> 
        {nft.meta.name && nft.meta.name.trim() !== "" && (
          <div className="nft__name">{nft.meta.name}</div>
        )}
        <div className="nft__meta_row">
          <div className="nft__meta_title">NFT Address</div>
          <div className="nft__meta_dot"></div>
          <div className="nft__meta_value">
            <a
              href={`https://goerli.etherscan.io/address/${nft.address}`}
              target="_blank"
              rel="noreferrer"
            >
              {nft.address}
            </a>
          </div>
        </div>
        <div className="nft__meta_row">
          <div className="nft__meta_title">Token id</div>
          <div className="nft__meta_dot"></div>
          <div className="nft__meta_value">{nft.tokenId}</div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default CatalogueItem;
