import React, { useState, useEffect, useCallback, useContext } from "react";

import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../consts";
import { Nft } from "../contexts/graph/classes";
import { CurrentAddressContext } from "../hardhat/SymfoniContext";
import GraphContext from "../contexts/graph";
import {
  addOrRemoveUserFavorite,
  nftId,
  upvoteOrDownvote,
  getNftVote,
} from "../services/firebase";
import { CalculatedUserVote, UsersVote } from "../contexts/graph/types";
import { calculateVoteByUser } from "../services/vote";
import CatalogueItemRow from "./catalogue-item-row";
import useIntersectionObserver from "../hooks/use-Intersection-observer";
import { fetchNFTMeta } from "../services/fetch-nft-meta";
import { LazyLoadImage } from "react-lazy-load-image-component";

export type CatalogueItemProps = {
  nft: Nft;
  checked?: boolean;
  isAlreadyFavourited?: boolean;
  // When Catalog Item have a multi-select we need to pass onCheckboxChange callback func
  onCheckboxChange?: (name: string, checked: boolean) => void;
};

const CatalogueItem: React.FC<CatalogueItemProps> = ({
  nft,
  checked,
  isAlreadyFavourited,
  onCheckboxChange,
  children,
}) => {
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;

  const [currentAddress] = useContext(CurrentAddressContext);
  const { userData, calculatedUsersVote } = useContext(GraphContext);
  const [inFavorites, setInFavorites] = useState<boolean>();
  const [isChecked, setIsChecked] = useState<boolean>(checked || false);
  const [currentVote, setCurrentVote] =
    useState<{
      downvote?: number;
      upvote?: number;
    }>();
  const [meta, setMeta] =
    useState<{
      name?: string;
      image?: string;
      description?: string;
    }>();
  const [imageIsReady, setImageIsReady] = useState<boolean>(false);

  const onCheckboxClick = useCallback(() => {
    setIsChecked(!isChecked);
    onCheckboxChange &&
      onCheckboxChange(
        `${nft.address}${RENFT_SUBGRAPH_ID_SEPARATOR}${nft.tokenId}`,
        !isChecked
      );
  }, [nft, isChecked, onCheckboxChange]);

  const addOrRemoveFavorite = useCallback(() => {
    addOrRemoveUserFavorite(currentAddress, nft.address, nft.tokenId)
      .then((resp: boolean) => {
        setInFavorites(resp);
      })
      .catch(() => {
        console.warn("could not change userFavorite");
      });
  }, [nft, currentAddress]);

  const handleVote = useCallback(
    (vote: number) => {
      upvoteOrDownvote(currentAddress, nft.address, nft.tokenId, vote)
        .then(() => {
          getNftVote(nft.address, nft.tokenId)
            .then((resp: UsersVote) => {
              const id = nftId(nft.address, nft.tokenId);
              const voteData: CalculatedUserVote = calculateVoteByUser(
                resp,
                id
              );
              // @ts-ignore
              const currentAddressVote = voteData?.[id] ?? {};
              setCurrentVote(currentAddressVote);
            })
            .catch(() => {
              console.warn("could not getNftVote");
            });
        })
        .catch(() => {
          console.warn("could not handle vote");
        });
    },
    [nft, currentAddress]
  );

  useEffect(() => {
    setIsChecked(checked || false);
    if (isVisible && !meta?.image) {
      fetchNFTMeta(nft)
        .then((response) => {
          setImageIsReady(true);
          setMeta(response);
        })
        .catch(() => console.warn("could not fetch nft meta"));
    }
  }, [checked, isVisible, nft, meta?.image]);

  const id = nftId(nft.address, nft.tokenId);
  const addedToFavorites =
    inFavorites !== undefined ? inFavorites : userData?.favorites?.[id];
  const nftVote =
    currentVote == undefined ? calculatedUsersVote[id] : currentVote;
  const { name, image, description } = meta || {};

  return (
    <div
      ref={ref}
      className={`nft ${isChecked ? "checked" : ""}`}
      key={nft.tokenId}
      data-item-id={nft.tokenId}
    >
      {!imageIsReady && (
        <div className="skeleton">
          <div className="skeleton-item control"></div>
          <div className="skeleton-item img"></div>
          <div className="skeleton-item meta-line"></div>
          <div className="skeleton-item meta-line"></div>
          <div className="skeleton-item meta-line"></div>
          <div className="skeleton-item btn"></div>
        </div>
      )}
      {imageIsReady && (
        <>
          <div className="nft__overlay">
            {!isAlreadyFavourited && (
              <div
                className={`nft__favourites ${
                  addedToFavorites ? "nft__favourites-on" : ""
                }`}
                onClick={addOrRemoveFavorite}
              />
            )}
            <div
              className="nft__vote nft__vote-plus"
              onClick={() => handleVote(1)}
            >
              <span className="icon-plus" />+{nftVote?.upvote || "?"}
            </div>
            <div
              className="nft__vote nft__vote-minus"
              onClick={() => handleVote(-1)}
            >
              <span className="icon-minus" />-{nftVote?.downvote || "?"}
            </div>
            <div className="spacer" />
            {onCheckboxChange && (
              <div className="nft__checkbox">
                <div
                  onClick={onCheckboxClick}
                  className={`checkbox ${isChecked ? "checked" : ""}`}
                ></div>
              </div>
            )}
          </div>
          <div className="nft__image">
            {image ? (
              <LazyLoadImage alt={description} src={image} />
            ) : (
              <div className="no-img">NO IMG</div>
            )}
          </div>
          <div className="nft__meta">
            {name && <div className="nft__name">{name}</div>}
            <CatalogueItemRow
              text="NFT Address"
              value={
                <a
                  href={`https://goerli.etherscan.io/address/${nft.address}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {nft.address}
                </a>
              }
            />
            <CatalogueItemRow text="Token id" value={nft.tokenId} />
          </div>
          {children}
        </>
      )}
    </div>
  );
};

export default CatalogueItem;
