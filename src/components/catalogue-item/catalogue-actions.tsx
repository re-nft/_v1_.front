import React, { useCallback, useContext, useState } from "react";
import {
  addOrRemoveUserFavorite,
  nftId,
  upvoteOrDownvote,
  getNftVote
} from "../../services/firebase";
import { CalculatedUserVote, UsersVote } from "../../contexts/graph/types";
import { calculateVoteByUser } from "../../services/vote";
import { CurrentAddressWrapper } from "../../contexts/CurrentAddressWrapper";
import GraphContext from "../../contexts/graph";

export const CatalogueActions: React.FC<{
  address: string;
  tokenId: string;
  id: string;
  isAlreadyFavourited: boolean;
}> = ({ address, tokenId, id, isAlreadyFavourited }) => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { userData, calculatedUsersVote } = useContext(GraphContext);
  const [inFavorites, setInFavorites] = useState<boolean>();
  const [currentVote, setCurrentVote] =
    useState<{
      downvote?: number;
      upvote?: number;
    }>();
  const addOrRemoveFavorite = useCallback(() => {
    addOrRemoveUserFavorite(currentAddress, address, tokenId)
      .then((resp: boolean) => {
        setInFavorites(resp);
      })
      .catch(() => {
        console.warn("could not change userFavorite");
      });
  }, [address, tokenId, currentAddress]);

  const handleVote = useCallback(
    (vote: number) => {
      upvoteOrDownvote(currentAddress, address, tokenId, vote)
        .then(() => {
          getNftVote(address, tokenId)
            .then((resp: UsersVote) => {
              const id = nftId(address, tokenId);
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
    [address, tokenId, currentAddress]
  );

  const handleUpVote = useCallback(() => handleVote(1), [handleVote]);
  const handleDownVote = useCallback(() => handleVote(-1), [handleVote]);

  const addedToFavorites =
    inFavorites !== undefined ? inFavorites : userData?.favorites?.[id];
  const nftVote =
    currentVote == undefined ? calculatedUsersVote[id] : currentVote;
  return (
    <>
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
    </>
  );
};
