import React, { useContext, useMemo, useCallback } from "react";
import { Nft } from "../../contexts/graph/classes";
import { CatalogueItemRow } from "./catalogue-item-row";
import { Checkbox } from "../common/checkbox";
import UserContext from "../../contexts/UserProvider";
import { Skeleton } from "./skeleton";
import { CatalogueItemDisplay } from "./catalogue-item-display";

import { useRouter } from "next/router";
import { useNftMetaState } from "../../hooks/useMetaState";
import shallow from "zustand/shallow";
import { Flipped, spring } from "react-flip-toolkit";
import { CopyLink } from "../copy-link";
import { ShortenPopover } from "../common/shorten-popover";

export type CatalogueItemProps = {
  nft: Nft;
  checked?: boolean;
  isAlreadyFavourited?: boolean;
  onCheckboxChange: () => void;
  disabled?: boolean;
};

const onElementAppear = (el: HTMLElement, index: number) =>
  spring({
    onUpdate: (val) => {
      el.style.opacity = val.toString();
    },
    delay: index * 50,
  });

const onExit =
  (type: "grid" | "list") =>
  (el: HTMLElement, index: number, removeElement: () => void) => {
    spring({
      config: { overshootClamping: true },
      onUpdate: (val) => {
        el.style.transform = `scale${type === "grid" ? "X" : "Y"}(${
          1 - Number(val)
        })`;
      },
      delay: index * 50,
      onComplete: removeElement,
    });

    return () => {
      el.style.opacity = "";
      removeElement();
    };
  };

export const CatalogueItem: React.FC<CatalogueItemProps> = ({
  nft,
  checked,
  onCheckboxChange,
  children,
  disabled,
}) => {
  const { signer } = useContext(UserContext);
  const meta = useNftMetaState(
    useCallback(
      (state) => {
        return state.metas[nft.nId] || {};
      },
      [nft.nId]
    ),
    shallow
  );

  const { pathname } = useRouter();
  const imageIsReady = useMemo(() => {
    return meta && !meta.loading;
  }, [meta]);

  const { name, image, description, openseaLink } = meta;

  const isRentPage = useMemo(() => {
    return pathname === "/" || pathname.includes("/rent");
  }, [pathname]);

  const shouldFlip = useCallback((prev, current) => {
    if (prev.type !== current.type) {
      return true;
    }
    return false;
  }, []);

  const knownContract = useMemo(() => {
    return (
      nft.address.toLowerCase() === "0x0db8c099b426677f575d512874d45a767e9acc3c"
    );
  }, [nft.address]);

  return (
    <Flipped
      key={nft.id}
      flipId={nft.id}
      onAppear={onElementAppear}
      onExit={onExit("grid")}
      stagger={true}
    >
      <div
        className="text-base leading-tight flex flex-col bg-white border-4 border-black"
        key={nft.tokenId}
        data-item-id={nft.tokenId}
      >
        {!imageIsReady && <Skeleton />}
        {imageIsReady && (
          <>
            <Flipped
              flipId={`${nft.id}-content`}
              translate
              shouldFlip={shouldFlip}
              delayUntil={nft.id}
            >
              <>
                <div className="flex justify-center space-x-2">
                  <a
                    className="flex-initial"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://rarible.com/token/${nft.address}:${nft.tokenId}`}
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
                  {/* <CatalogueActions
              address={nft.address}
              tokenId={nft.tokenId}
              id={id}
              isAlreadyFavourited={!!isAlreadyFavourited}
            /> */}
                  <div className="flex-1 flex justify-end justify-self-end">
                    <Checkbox
                      checked={!!checked}
                      onChange={onCheckboxChange}
                      disabled={disabled || !signer}
                    ></Checkbox>
                  </div>
                </div>
                <div className="border-b border-t border-black overflow-hidden aspect-w-1 aspect-h-1 overflow-hidden lg:h-50">
                  <CatalogueItemDisplay
                    image={image}
                    description={description}
                  />
                </div>
                <div className="font-display text-xs leading-tight text-center py-2 px-4 flex flex-col justify-center items-center">
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
                    {isRentPage && (
                      <CopyLink address={nft.address} tokenId={nft.tokenId} />
                    )}
                  </div>
                </div>
              </>
            </Flipped>
            <Flipped
              flipId={`${nft.id}-button`}
              shouldFlip={shouldFlip}
              delayUntil={nft.id}
            >
              <div className="px-2 flex flex-auto flex-col">
                <CatalogueItemRow
                  text="Address"
                  value={<ShortenPopover longString={nft.address} />}
                />
                <CatalogueItemRow
                  text="Token id"
                  value={<ShortenPopover longString={nft.tokenId} />}
                />
                <CatalogueItemRow
                  text="Standard"
                  value={nft.isERC721 ? "721" : "1155"}
                />
                <CatalogueItemRow text="Amount" value={nft.amount} />
                {children}
              </div>
            </Flipped>
          </>
        )}
      </div>
    </Flipped>
  );
};
