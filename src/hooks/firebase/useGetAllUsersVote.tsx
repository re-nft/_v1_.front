import { UsersVote } from "../../contexts/graph/types";
import { useCallback } from "react";
import { useFirebaseDatabase } from "./useFirebaseDatabase";

export const useGetAllUsersVote = (): (() => Promise<UsersVote>) => {
  const database = useFirebaseDatabase();

  const getAllUsersVote = useCallback(async (): Promise<UsersVote> => {
    const voteRef = database.ref("vote/");
    return new Promise((resolve, reject) => {
      voteRef
        .once("value")
        .then((snapshot) => {
          if (snapshot.val()) {
            const userVote: UsersVote = snapshot.val();
            resolve(userVote);
          } else {
            resolve({});
          }
        })
        .catch((e) => reject(e));
    });
  }, [database]);
  return getAllUsersVote;
};
