import React, { useMemo, useCallback, useEffect } from "react";
import { Transition } from "@headlessui/react";
import shallow from "zustand/shallow";
import { ASTROCAT_CONTRACT_ADDRESS } from "renft-front/consts";

import { useNftMetaState } from "renft-front/hooks/store/useMetaState";
import { useWallet } from "renft-front/hooks/store/useWallet";
import {
  useNftsStore,
  useRentingStore,
  useLendingStore,
} from "renft-front/hooks/store/useNftStore";
import { useEventTrackedTransactionState } from "renft-front/hooks/store/useEventTrackedTransactions";

import { ShortenPopover } from "renft-front/components/common/shorten-popover";
import { Button } from "renft-front/components/common/button";
import { PendingTransactionsLoader } from "renft-front/components/pending-transactions-loader";
import type {
  ReactEventOnChangeType,
  ReactEventOnClickType,
} from "renft-front/types";
import { classNames } from "renft-front/utils";

import { Skeleton } from "./skeleton";
import { CatalogueItemRow } from "./catalogue-item-row";
import { CatalogueActions } from "./catalogue-actions";
import { CatalogueItemDisplay } from "./catalogue-item-display";
import { CountDown } from "renft-front/components/common/countdown";

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
  "data-testid"?: string
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
  const lending = useLendingStore(
    useCallback((state) => state.lendings[uniqueId], [uniqueId])
  );
  const renting = useRentingStore(
    useCallback(
      (state) =>
        lending?.rentingId ? state.rentings[lending.rentingId] : null,
      [lending?.rentingId]
    )
  );
  const { signer } = useWallet();
  const meta = useNftMetaState(
    useCallback(
      (state) => {
        return state.metas[nft?.nId] || {};
      },
      [nft?.nId]
    ),
    shallow
  );

  const imageIsReady = useMemo(() => {
    if (!meta) return false;
    if (typeof meta.loading === "undefined") return false;
    return !meta.loading;
  }, [meta]);

  const { name, image, openseaLink } = meta;
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
    return nft?.nftAddress.toLowerCase() === ASTROCAT_CONTRACT_ADDRESS;
  }, [nft?.nftAddress]);

  const cb: ReactEventOnClickType = useCallback(
    (e: React.MouseEvent<unknown>) => {
      e.stopPropagation();
      e.preventDefault();
      if (disabled) return;
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
      onCheckboxChange(e);
    },
    [disabled, onCheckboxChange]
  );
  const actionDisabled = useMemo(() => {
    return disabled || !checked || !signer;
  }, [disabled, checked, signer]);

  return (
    <Transition
      show={show}
      as="li"
      enter="transition-opacity ease-linear duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity ease-linear duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      key={nft?.id}
      className={classNames(
        disabled && "cursor-not-allowed",
        !disabled && "hover:shadow-rn-one",
        !disabled && checked && "shadow-rn-one border-4",
        "text-base leading-tight flex flex-col bg-white border-2 border-black pb-1"
      )}
      aria-selected={!disabled && !!checked}
      role="gridcell"
      data-testid={rest["data-testid"]}
    >
      {!imageIsReady && <Skeleton />}
      {imageIsReady && (
        <div data-testid="catalogue-item-loaded">
          <div onClick={onChange}>
            <>
              <div className="flex justify-center space-x-2">
                <CatalogueActions
                  id={nId}
                  nftAddress={nft?.nftAddress || ""}
                  tokenId={nft?.tokenId || ""}
                  disabled={disabled || !signer}
                  checked={!disabled && !!checked}
                  onCheckboxChange={onCheckboxChange}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-x-0 top-0 h-16 z-10">
                  {renting && (
                    <CountDown
                      endTime={renting?.rentalEndTime || 0}
                      claimed={lending?.collateralClaimed || false}
                    />
                  )}
                </div>
                <CatalogueItemDisplay image={image} description={name} />
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
                      aria-label="verified"
                    >
                      <img src="/assets/nft-verified.png" alt="" />
                    </a>
                  )}
                </div>
              </div>
            </>
            <div className="px-2 flex flex-auto flex-col text-black">
              <CatalogueItemRow
                text="NFT Address"
                value={<ShortenPopover longString={nft?.nftAddress || ""} />}
              />
              <CatalogueItemRow
                text="Token id"
                value={<ShortenPopover longString={nft?.tokenId || ""} />}
              />
              <CatalogueItemRow
                text="Standard"
                value={nft?.isERC721 ? "721" : "1155"}
              />
              {children}
            </div>
          </div>
          {/* this is here because event  */}
          <div className="py-3 flex flex-auto space-between px-2">
            <div className="flex-1">
              <a
                className="flex-initial"
                aria-label="rarible link"
                target="_blank"
                rel="noreferrer"
                href={`https://rarible.com/token/${nft?.nftAddress}:${nft?.tokenId}`}
              >
                <img src="/assets/rarible.png" className="nft__icon" alt="" />
              </a>
              {openseaLink && (
                <a
                  className="flex-initial"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="opensea link"
                  href={openseaLink}
                >
                  <img src="/assets/opensea.png" className="nft__icon" alt="" />
                </a>
              )}
            </div>

            {rest.hasAction && (
              <div className="flex-1 flex justify-end pr-2">
                <Button
                  onClick={cb}
                  description={rest.buttonTitle}
                  data-testid="catalogue-action"
                  disabled={actionDisabled}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </Transition>
  );
};
