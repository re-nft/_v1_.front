import firebase from "firebase/app";
import "firebase/database";

import { Address } from "../types";
import { UserData, UsersVote } from "../contexts/graph/types";
import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../consts";

const config = {
  // my test firebase database
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL:
    process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDERID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

firebase.initializeApp(config);

const database = firebase.database();

export const nftId = (nftAddress: Address, tokenId: string): string => {
  return `${nftAddress}${RENFT_SUBGRAPH_ID_SEPARATOR}${tokenId}`;
};

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
  const id = nftId(nftAddress, tokenId);
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
  const id = nftId(nftAddress, tokenId);
  const voteRef = database.ref("vote/" + id + "/");
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
  const id = nftId(nftAddress, tokenId);
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
