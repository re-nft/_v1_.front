import React, { useState, useEffect, useCallback, useContext } from "react";
import { Nft } from "../../contexts/graph/classes";
import {CurrentAddressContext} from "../../hardhat/SymfoniContext";
import GraphContext from "../../contexts/graph";
import {addOrRemoveUserFavorite, nftId, upvoteOrDownvote, getNftVote} from '../../services/firebase';
import { CalculatedUserVote, UserData, UsersVote } from "../../contexts/graph/types";
import {calculateVoteByUser} from '../../services/vote';

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
  const [currentAddress] = useContext(CurrentAddressContext);
  const { userData, calculatedUsersVote, usersVote } = useContext(GraphContext);
  const [img, setImg] = useState<string>();
  const [inFavorites, setInFavorites] = useState<boolean>();
  const [isChecked, setIsChecked] = useState<boolean>(checked || false);
  const [currentVote, setCurrentVote] = useState<{downvote?: number, upvote?: number}>();
  
  const loadMediaURI = async () => {
    const mediaURI = await nft.mediaURI();
    return mediaURI;
  };
  
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
  }, [checked]);

  useEffect(() => {
    loadMediaURI()
      .then((mediaUri) => setImg(mediaUri))
      .catch(() => "");
    /* eslint-disable-next-line */
  }, []);

  const id = nftId(nft.address, nft.tokenId);
  const addedToFavorites = inFavorites !== undefined ? inFavorites : userData?.favorites?.[id];

  // const currentAddressVote = usersVote?.[id]?.[currentAddress] ?? {}; 
  const nftVote = currentVote == undefined ? calculatedUsersVote[id] : currentVote;
  
  return (
    <div className="nft" key={nft.tokenId} data-item-id={nft.tokenId}>
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
