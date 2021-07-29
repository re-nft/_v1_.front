import React, { useContext, useMemo } from "react";

import { Nft } from "../../contexts/graph/classes";
import { nftId } from "../../services/firebase";
import { CatalogueItemRow } from "./catalogue-item-row";
import { NFTMetaContext } from "../../contexts/NftMetaState";
import { Checkbox } from "../common/checkbox";
import UserContext from "../../contexts/UserProvider";
import { Skeleton } from "./skeleton";
import { CatalogueItemDisplay } from "./catalogue-item-display";

export type CatalogueItemProps = {
  nft: Nft;
  checked?: boolean;
  isAlreadyFavourited?: boolean;
  onCheckboxChange: () => void;
  disabled?: boolean
};

export const CatalogueItem: React.FC<CatalogueItemProps> = ({
  nft,
  checked,
  onCheckboxChange,
  children,
  disabled
}) => {
  const { signer } = useContext(UserContext);
  const [metas] = useContext(NFTMetaContext);
  const id = useMemo(
    () => nftId(nft.address, nft.tokenId),
    [nft.address, nft.tokenId]
  );
  const meta = useMemo(() => metas[id], [metas, id]);
  const noWallet = !signer;

  const imageIsReady = useMemo(() => {
    return meta && !meta.loading;
  }, [meta]);

  const { name, image, description, openseaLink, isVerified } = meta || {};

  return (
    <div
      className={`nft ${checked ? "checked" : ""} ${
        nft.isERC721 ? "nft__erc721" : "nft__erc1155"
      }`}
      key={nft.tokenId}
      data-item-id={nft.tokenId}
    >
      {!imageIsReady && <Skeleton />}
      {imageIsReady && (
        <>
          <div className="nft__overlay">
            <a className="nft__link" target="_blank" rel="noreferrer" href={`https://rarible.com/token/${nft.address}:${nft.tokenId}`} >
              <img src="/assets/rarible.png" className="nft__icon" />
            </a>
            {openseaLink && <a className="nft__link" target="_blank"  rel="noreferrer" href={openseaLink}>
              <img src="/assets/opensea.png" className="nft__icon" />
            </a>}
            {/* <CatalogueActions
              address={nft.address}
              tokenId={nft.tokenId}
              id={id}
              isAlreadyFavourited={!!isAlreadyFavourited}
            /> */}
            <div className="spacer" />
            <Checkbox
              checked={!!checked}
              onChange={onCheckboxChange}
              disabled={disabled || noWallet}
            ></Checkbox>
          </div>
          <div className="nft__image">
            <CatalogueItemDisplay image={image} description={description} />
          </div>
          <div className="nft__name">
            {name}
            {isVerified && <a className="nft__link"  target="_blank" rel="noreferrer">
              <img src="/assets/nft-verified.png" className="nft__icon small" />
            </a>
            }
          </div>

          <CatalogueItemRow
            text="Address"
            value={
              <a
                href={`https://etherscan.io/address/${nft.address}`}
                target="_blank"
                rel="noreferrer"
              >
                {nft.address}
              </a>
            }
          />
          <CatalogueItemRow text="Token id" value={nft.tokenId} />
          <CatalogueItemRow
            text="Standard"
            value={nft.isERC721 ? "721" : "1155"}
          />
          <CatalogueItemRow text="Amount" value={nft.amount} />
          {children}
        </>
      )}
    </div>
  );
};
