import React, { useCallback, useMemo } from "react";
import {
  addOrRemoveUserFavorite,
  upvoteOrDownvote
} from "../../services/firebase";
import { getUniqueID } from "../../utils";
import ArrowUp from "@heroicons/react/solid/ArrowUpIcon";
import ArrowDown from "@heroicons/react/solid/ArrowDownIcon";
import Heart from "@heroicons/react/solid/HeartIcon";
import HeartOutline from "@heroicons/react/outline/HeartIcon";
import { useUserData } from "../../hooks/store/useUserData";
import { useCurrentAddress } from "../../hooks/misc/useCurrentAddress";
import { CopyLink } from "../copy-link";
import Checkbox from "../common/checkbox";
import { ReactEventOnChangeType } from "../../types";

export const CatalogueActions: React.FC<{
  nftAddress: string;
  tokenId: string;
  checked: boolean;
  onCheckboxChange: ReactEventOnChangeType;
  disabled?: boolean;
}> = ({ nftAddress, tokenId, checked, onCheckboxChange, disabled }) => {
  const currentAddress = useCurrentAddress();
  const id = useMemo(() => {
    return getUniqueID(nftAddress, tokenId);
  }, [nftAddress, tokenId]);

  const {
    userData: { favorites = {} },
    calculatedUsersVote = {},
    usersVote = {},
    refreshUserData,
    refreshVotes
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
    addOrRemoveUserFavorite(currentAddress, nftAddress, tokenId)
      .then(refreshUserData)
      .catch(() => {
        console.warn("could not change userFavorite");
      });
  }, [nftAddress, tokenId, currentAddress, refreshUserData]);

  const handleVote = useCallback(
    (vote: number) => {
      upvoteOrDownvote(currentAddress, nftAddress, tokenId, vote)
        .then(refreshVotes)
        .catch(() => {
          console.warn("could not handle vote");
        });
    },
    [nftAddress, tokenId, currentAddress, refreshVotes]
  );

  const handleUpVote = useCallback(() => handleVote(1), [handleVote]);
  const handleDownVote = useCallback(() => handleVote(-1), [handleVote]);

  return (
    <div className="flex flex-auto flex-row space-x-1 content-evenly p-1">
      <div className="flex-1 flex space-x-1 items-center">
        <button className="flex-1 inline-block text-xl leading-none" onClick={handleUpVote}>
          {upvoted ? (
            <ArrowUp className="inline-block h-5 w-5 text-rn-green-dark stroke-2" />
          ) : (
            <ArrowUp className="inline-block h-5 w-5 text-gray-300" />
          )}
          <span className="inline-block text-rn-green">
            {nftVote?.upvote || "?"}
          </span>
        </button>
        <button className="flex-1 inline-block text-xl leading-none" onClick={handleDownVote}>
          {downvoted ? (
            <ArrowDown className="inline-block h-5 w-5 text-rn-red-dark stroke-2" />
          ) : (
            <ArrowDown className="inline-block h-5 w-5 text-gray-300" />
          )}
          <span className="text-rn-red"> {nftVote?.downvote || "?"}</span>
        </button>
      </div>

      <div className="flex-1 flex justify-center items-center pl-3">
        <CopyLink address={nftAddress} tokenId={tokenId}></CopyLink>
      </div>
      <div className="flex-1 flex justify-end items-center space-x-2 pr-2">
        <button className="flex" onClick={addOrRemoveFavorite}>
          {isFavorited ? (
            <Heart className="h-5 w-5 text-rn-red"></Heart>
          ) : (
            <HeartOutline className="h-5 w-5 text-rn-red"></HeartOutline>
          )}
        </button>
        <div>
          <Checkbox
            checked={checked}
            onChange={onCheckboxChange}
            disabled={disabled}
            label="Toggle catalougeItem"
            ariaLabel="Toggle catalougeItem"
          ></Checkbox>
        </div>
      </div>
    </div>
  );
};
