import { useCallback } from "react";
import { Address } from "../../types";
import { useFirebaseDatabase } from "./useFirebaseDatabase";
import { nftIdFirebase } from "../../utils";
import { UsersVote } from "../../contexts/graph/types";

export const useGetNftVote = (): ((
    nftAddress: Address,
    tokenId: string
  ) => Promise<UsersVote | undefined>) => {
    const database = useFirebaseDatabase();
  
    const getNftVote = useCallback(
      async (nftAddress: Address, tokenId: string): Promise<UsersVote | undefined> => {
        if (!database) return;

        const id = nftIdFirebase(nftAddress, tokenId);
        return new Promise((resolve, reject) => {
          database
            .ref("vote/" + id + "/")
            .once("value")
            .then((snapshot) => {
              resolve(snapshot.val());
            })
            .catch((e) => reject(e));
        });
      },
      [database]
    );
    return getNftVote;
  };
  
  