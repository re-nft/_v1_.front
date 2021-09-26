import React, { useMemo, useCallback } from "react";
import { CatalogueItemRow } from "./catalogue-item-row";
import { Skeleton } from "./skeleton";
import { CatalogueItemDisplay } from "./catalogue-item-display";

import { useNftMetaState } from "../../hooks/store/useMetaState";
import shallow from "zustand/shallow";
import { ShortenPopover } from "../common/shorten-popover";
import { CatalogueActions } from "./catalogue-actions";
import { useWallet } from "../../hooks/store/useWallet";
import { Button } from "../common/button";
import { useNftsStore } from "../../hooks/store/useNftStore";
import { useEventTrackedTransactionState } from "../../hooks/store/useEventTrackedTransactions";
import { ReactEventOnChangeType, ReactEventOnClickType } from "../../types";
import { Transition } from "@headlessui/react";
import { classNames } from "../../utils";
import { PendingTransactionsLoader } from "../pending-transactions-loader";

type CatalougeItemBaseProps = {
  // nftId
  nId: string;
  checked?: boolean;
  isAlreadyFavourited?: boolean;
  onCheckboxChange: ReactEventOnChangeType;
  disabled?: boolean;
  show: boolean;
  // lending/renting uniqueId, nftId if not lended yet
  uniqueId: string;
};
type CatalogueItemWithAction = CatalougeItemBaseProps & {
  onClick: ReactEventOnClickType;
  buttonTitle: string;
  hasAction: true;
};

export type CatalogueItemProps =
  | CatalogueItemWithAction
  | (CatalougeItemBaseProps & { hasAction?: false });

export const CatalogueItem: React.FC<CatalogueItemProps> = ({
  nId,
  checked,
  onCheckboxChange,
  children,
  disabled,
  show,
  uniqueId,
  ...rest
}) => {
  const nft = useNftsStore(useCallback((state) => state.nfts[nId], [nId]));
  const { signer } = useWallet();
  const meta = useNftMetaState(
    useCallback(
      (state) => {
        return state.metas[nft.nId] || {};
      },
      [nft.nId]
    ),
    shallow
  );

  const imageIsReady = useMemo(() => {
    return meta && !meta.loading;
  }, [meta]);

  const { name, image, description, openseaLink } = meta;
  const pendingStatus = useEventTrackedTransactionState(
    useCallback(
      (state) => {
        return state.uiPendingTransactionState[uniqueId];
      },
      [uniqueId]
    ),
    shallow
  );

  const knownContract = useMemo(() => {
    return (
      nft.nftAddress.toLowerCase() ===
      "0x0db8c099b426677f575d512874d45a767e9acc3c"
    );
  }, [nft.nftAddress]);

  const cb: ReactEventOnClickType = useCallback(
    (e: React.MouseEvent<unknown>) => {
      if (disabled) return;
      console.log(e);
      // stop propagation is not working, manually disable checkbox toggling
      if (rest.hasAction) {
        rest.onClick(e);
      }
    },
    [rest, disabled]
  );
  const onChange: ReactEventOnChangeType = useCallback(
    (e: React.ChangeEvent<unknown>) => {
      if (disabled) return;
      console.log("oncheckboxchange");
      onCheckboxChange(e);
    },
    [disabled, onCheckboxChange]
  );

  return (
    <Transition
      show={show}
      as="div"
      enter="transition-opacity ease-linear duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity ease-linear duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      key={nft.id}
      className={classNames(
        disabled && "cursor-not-allowed",
        !disabled && "hover:shadow-rn-one",
        checked && "shadow-rn-one border-4",
        "text-base leading-tight flex flex-col bg-white border-2 border-black pb-1"
      )}
    >
      {!imageIsReady && <Skeleton />}
      {imageIsReady && (
        <>
          <div onClick={onChange}>
            <>
              <div className="flex justify-center space-x-2">
                <CatalogueActions
                  nftAddress={nft.nftAddress}
                  tokenId={nft.tokenId}
                  disabled={disabled || !signer}
                  checked={!!checked}
                  onCheckboxChange={onCheckboxChange}
                />
              </div>
              <div className="relative">
                <CatalogueItemDisplay image={image} description={description} />
                <div className="absolute inset-0  flex items-center text-center justify-center">
                  <PendingTransactionsLoader status={pendingStatus} />
                </div>
              </div>
              <div className="font-body text-xl leading-rn-1 tracking-wide text-center py-3 px-4 flex flex-col justify-center items-center">
                <p className="flex-initial">{name}</p>
                <div className="flex flex-auto flex-row">
                  {knownContract && (
                    <a
                      className="flex-initial p-2"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src="/assets/nft-verified.png"
                        className="nft__icon small"
                      />
                    </a>
                  )}
                </div>
              </div>
            </>
            <div className="px-2 flex flex-auto flex-col text-black">
              <CatalogueItemRow
                text="NFT Address"
                value={<ShortenPopover longString={nft.nftAddress} />}
              />
              <CatalogueItemRow
                text="Token id"
                value={<ShortenPopover longString={nft.tokenId} />}
              />
              <CatalogueItemRow
                text="Standard"
                value={nft.isERC721 ? "721" : "1155"}
              />

              {children}
            </div>
          </div>
          {/* this is here because event  */}
          <div className="py-3 flex flex-auto space-between px-2">
            <div className="flex-1">
              <a
                className="flex-initial"
                target="_blank"
                rel="noreferrer"
                href={`https://rarible.com/token/${nft.nftAddress}:${nft.tokenId}`}
              >
                <img src="/assets/rarible.png" className="nft__icon" />
              </a>
              {openseaLink && (
                <a
                  className="flex-initial"
                  target="_blank"
                  rel="noreferrer"
                  href={openseaLink}
                >
                  <img src="/assets/opensea.png" className="nft__icon" />
                </a>
              )}
            </div>

            {rest.hasAction && (
              <div className="flex-1 flex justify-end pr-2">
                <Button
                  onClick={cb}
                  description={rest.buttonTitle}
                  disabled={disabled || !checked || !signer}
                />
              </div>
            )}
          </div>
        </>
      )}
    </Transition>
  );
};
