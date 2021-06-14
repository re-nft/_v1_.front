import { useCallback } from "react";
import { Address } from "../../types";
import { useFirebaseDatabase } from "./useFirebaseDatabase";
import { nftIdFirebase } from "../../utils";

export const useUpvoteOrDownvote = (): ((
  currentAddress: string,
  nftAddress: Address,
  tokenId: string,
  vote: number
) => Promise<void>) => {
  const database = useFirebaseDatabase();

  const upvoteOrDownvote = useCallback(
    async (
      currentAddress: string,
      nftAddress: Address,
      tokenId: string,
      vote: number
    ): Promise<void> => {
      if (!database) return;
      const id = nftIdFirebase(nftAddress, tokenId);
      const voteUserRef = database.ref("vote/" + id + "/" + currentAddress);
      return new Promise((resolve, reject) => {
        voteUserRef
          .once("value")
          .then(() => {
            const reqObj = vote === 1 ? { upvote: 1 } : { downvote: 1 };
            voteUserRef.set(reqObj, (error) => {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            });
          })
          .catch((e) => reject(e));
      });
    },
    [database]
  );
  return upvoteOrDownvote;
};
