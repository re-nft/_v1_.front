import React, { useState, useEffect, useCallback, useContext } from "react";

import { BatchContext } from "../controller/batch-controller";
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

export type CatalogueItemProps = {
  nft: Nft;
  checked?: boolean;
  isAlreadyFavourited?: boolean;
};

const CatalogueItem: React.FC<CatalogueItemProps> = ({
  nft,
  checked,
  isAlreadyFavourited,
  children,
}) => {
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;

  const { onCheckboxChange } = useContext(BatchContext);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { userData, calculatedUsersVote } = useContext(GraphContext);
  const [inFavorites, setInFavorites] = useState<boolean>();
  const [isChecked, setIsChecked] = useState<boolean>(checked || false);
  const [amount, setAmount] = useState<string>("0");
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
    // ! either pass a type as the id, or do not assume that the id must have a certain
    // ! format inside of the onCheckboxChange
    onCheckboxChange(nft);
  }, [nft, isChecked, onCheckboxChange]);

  const preloadImage = (imgSrc: string) => {
    const img = new Image();
    img.onload = () => setImageIsReady(true);
    img.onerror = () => setImageIsReady(true);
    img.src = imgSrc;
  };

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

  const handleUpVote = useCallback(() => handleVote(1), [handleVote]);
  const handleDownVote = useCallback(() => handleVote(-1), [handleVote]);

  useEffect(() => {
    setIsChecked(checked || false);
    if (isVisible && !meta?.image) {
      fetchNFTMeta(nft)
        .then((response) => {
          if (response?.image) {
            preloadImage(response?.image);
          } else {
            setImageIsReady(true);
          }
          setMeta(response);
        })
        .catch(() => console.warn("could not fetch nft meta"));
    }

    if (!nft.isERC721 && currentAddress) {
      nft
        .loadAmount(currentAddress)
        .then((a) => {
          setAmount(a);
        })
        .catch(() => console.warn("could not load amount"));
    }
  }, [checked, isVisible, nft, meta?.image, currentAddress]);

  const id = nftId(nft.address, nft.tokenId);
  const addedToFavorites =
    inFavorites !== undefined ? inFavorites : userData?.favorites?.[id];
  const nftVote =
    currentVote == undefined ? calculatedUsersVote[id] : currentVote;
  const { name, image } = meta || {};

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
            <div className="nft__vote nft__vote-plus" onClick={handleUpVote}>
              <span className="icon-plus" />+{nftVote?.upvote || "?"}
            </div>
            <div className="nft__vote nft__vote-minus" onClick={handleDownVote}>
              <span className="icon-minus" />-{nftVote?.downvote || "?"}
            </div>
            <div className="spacer" />
            <div className="nft__checkbox">
              <div
                onClick={onCheckboxClick}
                className={`checkbox ${isChecked ? "checked" : ""}`}
              />
            </div>
          </div>
          <div className="nft__image">
            {image ? (
              <img loading="lazy" src={image} />
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
            <CatalogueItemRow
              text="Amount"
              value={nft.isERC721 ? "1" : amount}
            />
          </div>
          {children}
        </>
      )}
    </div>
  );
};

export default CatalogueItem;
