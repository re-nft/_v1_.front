import React, { useMemo, useCallback } from "react";
import { Transition } from "@headlessui/react";
import shallow from "zustand/shallow";

import { useNftMetaState } from "renft-front/hooks/store/useMetaState";
import { useWallet } from "renft-front/hooks/store/useWallet";
import { useNftsStore } from "renft-front/hooks/store/useNftStore";
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
    if (nId === "0x0db8c099b426677f575d512874d45a767e9acc3c::1::0") {
      console.log(checked, disabled || !checked || !signer)
    }
    return disabled || !checked || !signer;
  }, [disabled, checked, signer, nId])

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
      data-testid='catalogue-item'
    >
      {!imageIsReady && <Skeleton />}
      {imageIsReady && (
        <div data-testid='catalogue-item-loaded'>
          <div onClick={onChange}>
            <>
              <div className="flex justify-center space-x-2">
                <CatalogueActions
                  id={nId}
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
                  id={`catalogue-button-${nId}`}
                  data-testid="catalogue-item-action"
                  onClick={cb}
                  description={rest.buttonTitle}
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
