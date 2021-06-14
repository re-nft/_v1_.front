import { useCallback } from "react";
import { useFirebaseDatabase } from "./useFirebaseDatabase";
import { UserData } from "../../contexts/graph/types";

const newUserData = {
  name: "",
  bio: "",
};

export const useGetUserDataOrCrateNew = (): ((
  currentAddress: string
) => Promise<UserData>) => {
  const database = useFirebaseDatabase();
  const createNewUser = useCallback(
    async (currentAddress: string): Promise<UserData> => {
      const userRef = database.ref("users/" + currentAddress);
      return new Promise((resolve, reject) => {
        userRef.set(
          {
            name: "",
          },
          (error) => {
            if (error) {
              reject(" The write failed... ");
            } else {
              resolve(newUserData);
            }
          }
        );
      });
    },
    [database]
  );

  const getUserDataOrCrateNew = useCallback(
    async (currentAddress: string): Promise<UserData> => {
      const userRef = database.ref("users/" + currentAddress);
      return new Promise((resolve, reject) => {
        userRef
          .once("value")
          .then((snapshot) => {
            if (snapshot.val()) {
              return resolve(snapshot.val());
            } else {
              return resolve(createNewUser(currentAddress));
            }
          })
          .catch((e) => reject(e));
      });
    },
    [createNewUser, database]
  );
  return getUserDataOrCrateNew;
};
