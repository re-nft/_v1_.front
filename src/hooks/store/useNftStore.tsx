import { Lending, Nft, Renting } from "../../types/classes";
import create from "zustand";
import { devtools } from "zustand/middleware";
import produce from "immer";

type NftMetaState = {
  nfts: Record<string, Nft>;
  addNfts: (nfts: Nft[]) => void
};

export const useNftsStore = create<NftMetaState>(
  devtools(
    (set) => ({
      nfts: {},
      addNfts: (nfts: Nft[]) =>
        set(
          produce((state) => {
            nfts.map((nft) => {
             const previousNft = state.nfts[nft.id];
              state.nfts[nft.id] = {
                  ...previousNft,
                  ...nft
              };
            });
          })
        )
    }),
    "nft-store"
  )
);

type LendingState = {
  lendings: Record<string, Lending>;
  addLendings: (nfts: Lending[]) => void
};

export const useLendingStore = create<LendingState>(
  devtools(
    (set) => ({
      lendings: {},
      addLendings: (lendings: Lending[]) =>
        set(
          produce((state) => {
            lendings.map((lending) => {
             const previousNft = state.lendings[lending.id];
              state.lendings[lending.id] = {
                  ...previousNft,
                  ...lending
              };
            });
          })
        )
    }),
    "lending-store"
  )
);
type RentingState = {
  rentings: Record<string, Renting>;
  addRentings: (nfts: Renting[]) => void
};
export const useRentingStore = create<RentingState>(
  devtools(
    (set) => ({
      rentings: {},
      addRentings: (rentings: Renting[]) =>
        set(
          produce((state) => {
            rentings.map((renting) => {
             const previousNft = state.rentings[renting.id];
              state.rentings[renting.id] = {
                  ...previousNft,
                  ...renting
              };
            });
          })
        )
    }),
    "renting-store"
  )
);
