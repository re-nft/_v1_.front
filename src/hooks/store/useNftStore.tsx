import { Lending, Nft, Renting } from "../../types/classes";
import create from "zustand";
import { devtools } from "zustand/middleware";
import produce from "immer";

export enum NFTRentType {
  USER_IS_LENDING,
  ALL_AVAILABLE_TO_RENT,
  USER_IS_RENTING
}
export enum OWNED_NFT_TYPE {
  DEV_NFT = 1,
  EXTERNAL_ERC721,
  EXTERNAL_ERC1155
}
type NftMetaState = {
  nfts: Record<string, Nft>;
  // ids of owned Nfts
  ownedNfts: string[];
  dev_nfts: string[];
  external_erc721s: string[];
  external_erc1155s: string[];
  // add nft metadatat to store, if ownedNfts specified it updates user ownedNfts
  // second argument add together the three seperate places where nfts can come from
  // if not specified than user has no ownership to nft
  addNfts: (nfts: Nft[], ownedNftType?: OWNED_NFT_TYPE) => void;
  // amounts are queried from a different source, so store it in different place to avoid unnessecary rerender and requery
  amounts: Map<string, number>;
  setAmount: (id: string, amount: number) => void;
};

// Nfts from 5 places
// devnfts both standard on localhost/ropsten
// erc721 for ownership
// erc1155 for ownership
// renting from our graph
// lending from our graph
// based on time and user the status are different
export const useNftsStore = create<NftMetaState>(
  devtools(
    (set) => ({
      nfts: {},
      ownedNfts: [],
      dev_nfts: [],
      external_erc721s: [],
      external_erc1155s: [],
      amounts: new Map<string, number>(),
      setAmount: (id: string, amount: number) =>
        set(
          produce((state) => {
            state.amounts.set(id, amount);
          })
        ),
      addNfts: (nfts: Nft[], ownedNftType?: OWNED_NFT_TYPE) =>
        set(
          produce((state) => {
            nfts.map((nft) => {
              const previousNft: Nft = state.nfts[nft.id];
              state.nfts[nft.id] = {
                ...previousNft,
                ...nft
              };
            });
            if (ownedNftType) {
              const ids = nfts.map((i) => i.nId);
              const set = new Set(...state.ownedNfts, ...ids);
              state.ownedNfts = Array.from(set);
              switch (ownedNftType) {
                case OWNED_NFT_TYPE.DEV_NFT: {
                  state.dev_nfts = ids;
                  return;
                }
                case OWNED_NFT_TYPE.EXTERNAL_ERC1155: {
                  state.external_erc1155s = ids;
                  return;
                }
                case OWNED_NFT_TYPE.EXTERNAL_ERC721: {
                  state.external_erc721s = ids;
                  ids.forEach((id) => state.amounts.set(id, 1));
                  return;
                }
              }
            }
          })
        )
    }),
    "nft-store"
  )
);

type LendingState = {
  lendings: Record<string, Lending>;
  addLendings: (nfts: Lending[], type: NFTRentType) => void;
  // ids
  userIsLending: string[];
  allAvailableToRent: string[];
};

export const useLendingStore = create<LendingState>(
  devtools(
    (set) => ({
      lendings: {},
      userIsLending: [],
      allAvailableToRent: [],
      addLendings: (lendings: Lending[], type: NFTRentType) =>
        set(
          produce((state) => {
            lendings.map((lending) => {
              const previousNft = state.lendings[lending.id];
              state.lendings[lending.id] = {
                ...previousNft,
                ...lending
              };
            });
            switch (type) {
              case NFTRentType.ALL_AVAILABLE_TO_RENT: {
                state.allAvailableToRent = lendings.map((i) => i.id);
                return;
              }
              case NFTRentType.USER_IS_LENDING: {
                state.userIsLending = lendings.map((i) => i.id);
                return;
              }
            }
          })
        )
    }),
    "lending-store"
  )
);
type RentingState = {
  userRenting: Renting[];
  rentings: Record<string, Renting>;
  addRentings: (nfts: Renting[], type: NFTRentType) => void;
};
// delete previous rentings, as only user rentings are stored here
export const useRentingStore = create<RentingState>(
  devtools(
    (set) => ({
      userRenting: [],
      rentings: {},
      addRentings: (rentings: Renting[], type: NFTRentType) =>
        set(
          produce((state: RentingState) => {
            if (type === NFTRentType.USER_IS_RENTING)
              state.userRenting = rentings;
            else if (type === NFTRentType.USER_IS_LENDING)
              rentings.map((renting) => {
                state.rentings[renting.id] = renting;
              })  
          })
        )
    }),
    "renting-store"
  )
);
