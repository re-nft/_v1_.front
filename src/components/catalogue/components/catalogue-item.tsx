import React, { useState, useEffect, useCallback, useContext } from "react";
import { Nft } from "../../../contexts/graph/classes";
import {CurrentAddressContext} from "../../../hardhat/SymfoniContext";
import GraphContext from "../../../contexts/graph";
import {addOrRemoveUserFavorite, nftId, upvoteOrDownvote, getNftVote} from '../../../services/firebase';
import { CalculatedUserVote, UsersVote } from "../../../contexts/graph/types";
import {calculateVoteByUser} from '../../../services/vote';
import CatalogueItemRow from './catalogue-item-row';
import useIntersectionObserver from '../../../hooks/use-Intersection-observer';

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
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;

  const [currentAddress] = useContext(CurrentAddressContext);
  const { userData, calculatedUsersVote } = useContext(GraphContext);
  const [inFavorites, setInFavorites] = useState<boolean>();
  const [isChecked, setIsChecked] = useState<boolean>(checked || false);
  const [currentVote, setCurrentVote] = useState<{downvote?: number, upvote?: number}>();
  const [meta, setMeta] = useState<{ name?: string; image?: string; description?: string; }>()
  
  const onCheckboxClick = useCallback(() => {
    setIsChecked(!isChecked);
    onCheckboxChange && onCheckboxChange(`${nft.address}::${nft.tokenId}`, !isChecked);
  }, [nft, isChecked]);
  
  const addOrRemoveFavorite = useCallback(() => {
    addOrRemoveUserFavorite(currentAddress, nft.address, nft.tokenId).then((resp: boolean) => {
      setInFavorites(resp);
    });
  }, [nft]);

  const handleVote = useCallback((vote: number) => {
    upvoteOrDownvote(currentAddress, nft.address, nft.tokenId, vote).then(() => {
      getNftVote(nft.address, nft.tokenId).then((resp: UsersVote) => {
        const id = nftId(nft.address, nft.tokenId);
        const voteData: CalculatedUserVote = calculateVoteByUser(resp, id);
        // @ts-ignore
        const currentAddressVote = voteData?.[id] ?? {}; 
        setCurrentVote(currentAddressVote);
      });
    });
  }, [nft, currentAddress]);

  useEffect(() => {
    setIsChecked(checked || false);
    if (isVisible && !meta?.image) {
      nft.meta().then(res => setMeta(res));
    }
  }, [checked, isVisible, meta?.image]);

  const id = nftId(nft.address, nft.tokenId);
  const addedToFavorites = inFavorites !== undefined ? inFavorites : userData?.favorites?.[id];
  const nftVote = currentVote == undefined ? calculatedUsersVote[id] : currentVote;
  const { name, image, description } = meta || {};  
  
  return (
    <div ref={ref} className="nft" key={nft.tokenId} data-item-id={nft.tokenId}>
      <div className="nft__overlay">
        <div className={`nft__favourites ${addedToFavorites ? 'nft__favourites-on' : ''}`} onClick={addOrRemoveFavorite}></div>
        <div className="nft__vote nft__vote-plus" onClick={() => handleVote(1)}>
          +{nftVote?.upvote || '?'}
        </div>
        <div className="nft__vote nft__vote-minus" onClick={() => handleVote(-1)}>
          -{nftVote?.downvote || '?'}
        </div>
      </div>
      {onCheckboxChange && (
        <div className="nft__checkbox">
          <div onClick={onCheckboxClick} className={`checkbox ${isChecked ? 'checked' : ''}`}></div>
        </div>
      )}
      <div className="nft__image">
          {image ? <img loading="lazy" src={image} /> : <div className="no-img">NO IMG</div>}
      </div>
      <div className="nft__meta"> 
        {name && (<div className="nft__name">{name}</div>)}
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
    </div>
  );
};

export default CatalogueItem;
