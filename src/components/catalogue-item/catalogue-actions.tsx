import React, { useCallback, useContext, useMemo } from "react";
import {
  addOrRemoveUserFavorite,
  upvoteOrDownvote,
} from "../../services/firebase";
import { CurrentAddressWrapper } from "../../contexts/CurrentAddressWrapper";
import { getUniqueID } from "../../utils";
import ArrowUp from "@heroicons/react/solid/ArrowUpIcon";
import ArrowDown from "@heroicons/react/solid/ArrowDownIcon";
import Sparkles from "@heroicons/react/solid/SparklesIcon";
import SparklesOutline from "@heroicons/react/outline/SparklesIcon";
import { useUserData } from "../../hooks/queries/useUserData";

export const CatalogueActions: React.FC<{
  address: string;
  tokenId: string;
}> = ({ address, tokenId }) => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const id = useMemo(() => {
    return getUniqueID(address, tokenId);
  }, [address, tokenId]);

  const {
    userData: { favorites = {} },
    calculatedUsersVote = {},
    usersVote = {},
    refreshUserData,
    refreshVotes,
  } = useUserData();

  const isFavorited = useMemo(() => {
    return !!favorites[id];
  }, [id, favorites]);

  const nftVote = useMemo(() => {
    return calculatedUsersVote
      ? calculatedUsersVote[id]
      : { upvote: null, downvote: null };
  }, [calculatedUsersVote, id]);

  const upvoted = useMemo(() => {
    const votesOnNFT = usersVote ? usersVote[id] : {};
    return votesOnNFT && votesOnNFT[currentAddress].upvote;
  }, [usersVote, id, currentAddress]);

  const downvoted = useMemo(() => {
    const votesOnNFT = usersVote ? usersVote[id] : {};
    return votesOnNFT && votesOnNFT[currentAddress].downvote;
  }, [usersVote, id, currentAddress]);

  const addOrRemoveFavorite = useCallback(() => {
    addOrRemoveUserFavorite(currentAddress, address, tokenId)
      .then(refreshUserData)
      .catch(() => {
        console.warn("could not change userFavorite");
      });
  }, [address, tokenId, currentAddress, refreshUserData]);

  const handleVote = useCallback(
    (vote: number) => {
      upvoteOrDownvote(currentAddress, address, tokenId, vote)
        .then(refreshVotes)
        .catch(() => {
          console.warn("could not handle vote");
        });
    },
    [address, tokenId, currentAddress, refreshVotes]
  );

  const handleUpVote = useCallback(() => handleVote(1), [handleVote]);
  const handleDownVote = useCallback(() => handleVote(-1), [handleVote]);

  return (
    <div className="flex justify-centers items-center space-x-1">
      <button className="flex" onClick={addOrRemoveFavorite}>
        {isFavorited ? (
          <Sparkles className="h-5 w-5 text-rn-purple"></Sparkles>
        ) : (
          <SparklesOutline className="h-5 w-5 text-rn-purple"></SparklesOutline>
        )}
      </button>

      <button className="flex" onClick={handleUpVote}>
        {upvoted ? (
          <ArrowUp className="h-5 w-5 text-rn-green-dark stroke-2" />
        ) : (
          <ArrowUp className="h-5 w-5 text-rn-green" />
        )}
        <span className="text-rn-green">+{nftVote?.upvote || "?"}</span>
      </button>
      <button className="flex" onClick={handleDownVote}>
        {downvoted ? (
          <ArrowDown className="h-5 w-5 text-rn-red-dark stroke-2" />
        ) : (
          <ArrowDown className="h-5 w-5 text-rn-red" />
        )}
        <span className="text-rn-red"> -{nftVote?.downvote || "?"}</span>
      </button>
    </div>
  );
};
