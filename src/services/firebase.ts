import { Address } from "../types";
import { UserData, UsersVote } from "../contexts/graph/types";
import firebase from "../firebase/clientApp";
import { getUniqueID } from "../utils";

const database = firebase.database();

// Defaul user data
const newUserData = {
  name: "",
  bio: "",
};

export const createNewUser = async (
  currentAddress: string
): Promise<UserData> => {
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
};

export const getUserDataOrCrateNew = async (
  currentAddress: string
): Promise<UserData> => {
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
};

export const updateUserData = async (
  currentAddress: string,
  name: string,
  bio: string
): Promise<UserData> => {
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
};

export const addOrRemoveUserFavorite = async (
  currentAddress: string,
  nftAddress: Address,
  tokenId: string
): Promise<boolean> => {
  const id = getUniqueID(nftAddress, tokenId);
  const userRef = database.ref("users/" + currentAddress + "/favorites/" + id);
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
};

export const getAllUsersVote = async (): Promise<UsersVote> => {
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
};

export const getNftVote = async (
  nftAddress: Address,
  tokenId: string
): Promise<UsersVote> => {
  const id = getUniqueID(nftAddress, tokenId);
  return new Promise((resolve, reject) => {
    database
      .ref("vote/" + id + "/")
      .once("value")
      .then((snapshot) => {
        resolve(snapshot.val());
      })
      .catch((e) => reject(e));
  });
};

export const upvoteOrDownvote = async (
  currentAddress: string,
  nftAddress: Address,
  tokenId: string,
  vote: number
): Promise<void> => {
  const id = getUniqueID(nftAddress, tokenId);
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
};
