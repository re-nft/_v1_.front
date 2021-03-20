import firebase from 'firebase/app'
import "firebase/database"
import { Address } from "../types";
import {UserData} from '../contexts/graph/types';

// TODO: move this to .env ang getting values via process.env[key]
const config = {
    // apiKey: "AIzaSyAFnsLe_Joxat6qusMBQEIyvjx5JWDLVyA",
    // authDomain: "renft-cache-nfts.firebaseapp.com",
    // databaseURL: "https://renft-cache-nfts-default-rtdb.firebaseio.com",
    //projectId: "renft-cache-nfts",
    //storageBucket: "renft-cache-nfts.appspot.com",
    //messagingSenderId: "155132754476",
    //appId: "1:155132754476:web:be027d2a19f422943b6f89",
    //measurementId: "G-KHE0KBEHTW",
    
    // my test firebase database
    apiKey: "AIzaSyAznbJwfefZeJ86FlDB6LDAdo_Ey6dfyhY",
    authDomain: "renft-bf03b.firebaseapp.com",
    databaseURL: "https://renft-bf03b-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "renft-bf03b",
    storageBucket: "renft-bf03b.appspot.com",
    messagingSenderId: "119002251713",
    appId: "1:119002251713:web:5edb39eb033357353d2f40"
};

firebase.initializeApp(config);

const database = firebase.database();

export const nftId = (nftAddress: Address, tokenId: string) => {
  return `${nftAddress}::${tokenId}`;
};

// Defaul user data
const newUserData = {
    name: "",
};

export const createNewUser = async (currentAddress: string): Promise<UserData> => {
    const userRef = database.ref('users/' + currentAddress);
    return new Promise((resolve, reject) => {
        userRef.set({
            name: ""
        }, (error) => {
            if (error) {
                reject(' The write failed... ');
            } else {
                resolve(newUserData);
            }
        });
    });
};

export const getUserDataOrCrateNew = async (currentAddress: string): Promise<UserData> => {
    const userRef = database.ref('users/' + currentAddress);
    return new Promise((resolve, reject) => {
        userRef.once('value').then((snapshot) => {
            if (snapshot.val()) {
                return resolve(snapshot.val());
            } else {
                return resolve(createNewUser(currentAddress));
            }
        }).catch(e => reject(e));
    });
};

export const addOrRemoveUserFavorite = async (currentAddress: string, nftAddress: Address, tokenId: string): Promise<boolean> => {
    const id = nftId(nftAddress, tokenId);
    const userRef = database.ref('users/' + currentAddress + '/favorites/' + id);
    return new Promise((resolve, reject) => {
        userRef.once('value').then((snapshot) => {
            if (snapshot.val()) {
                userRef.set(false);
                resolve(false);
            } else {
                userRef.set(true);
                resolve(true);
            }
        }).catch(e => reject(e));
    });
};