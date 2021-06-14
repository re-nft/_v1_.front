import { useCallback } from "react";
import { Address } from "../../types";
import { useFirebaseDatabase } from "./useFirebaseDatabase";
import { nftIdFirebase } from "../../utils";

export const useAddOrRemoveUserFavorite = (): ((
  currentAddress: string,
  nftAddress: Address,
  tokenId: string
) => Promise<boolean | undefined>) => {
  const database = useFirebaseDatabase();
  const addOrRemoveUserFavorite = useCallback(
    async (
      currentAddress: string,
      nftAddress: Address,
      tokenId: string
    ): Promise<boolean | undefined> => {
      if (!database) return;
      const id = nftIdFirebase(nftAddress, tokenId);
      const userRef = database.ref(
        "users/" + currentAddress + "/favorites/" + id
      );
      return new Promise((resolve, reject) => {
        userRef
          .once("value")
          .then((snapshot) => {
            if (snapshot.val()) {
              userRef.set(false);
              resolve(false);
            } else {
              userRef.set(true);
              resolve(true);
            }
          })
          .catch((e) => reject(e));
      });
    },
    [database]
  );
  return addOrRemoveUserFavorite;
};
