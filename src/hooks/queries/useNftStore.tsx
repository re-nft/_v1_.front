import { Nft } from "../../types/classes";
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
