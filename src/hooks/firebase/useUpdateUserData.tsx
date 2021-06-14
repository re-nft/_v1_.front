import { useCallback } from "react";
import { UserData } from "../../contexts/graph/types";
import { useFirebaseDatabase } from "./useFirebaseDatabase";

export const useUpdateUserData = (): ((
  currentAddress: string,
  name: string,
  bio: string
) => Promise<UserData | undefined>) => {
  const database = useFirebaseDatabase();
  const updateUserData = useCallback(
    async (
      currentAddress: string,
      name: string,
      bio: string
    ): Promise<UserData | undefined> => {
      if (!database) return;
      const userRef = database.ref("users/" + currentAddress);
      return new Promise((resolve, reject) => {
        userRef.set(
          {
            name,
            bio,
          },
          (error) => {
            if (error) {
              reject("failed... ");
            } else {
              resolve({ name, bio });
            }
          }
        );
      });
    },
    [database]
  );
  return updateUserData;
};
