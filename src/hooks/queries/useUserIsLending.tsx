import produce from "immer";
import shallow from "zustand/shallow";
import create from "zustand";

import { Lending, Nft } from "../../types/classes";
import { useCallback, useEffect } from "react";
import { usePrevious } from "../usePrevious";
import { SECOND_IN_MILLISECONDS } from "../../consts";
import { EMPTY, from, map, switchMap, timer } from "rxjs";
import { timeItAsync } from "../../utils";
import { LendingRaw } from "../../types";
import request from "graphql-request";
import { queryUserLendingRenft } from "../../services/queries";
import { useWallet } from "../useWallet";
import { useCurrentAddress } from "../useCurrentAddress";
import { useNftsStore } from "./useNftStore";

interface UserLending {
  userLending: Lending[];
  isLoading: false;
  setUserLending: (arr: Lending[]) => void;
  setLoading: (b: boolean) => void;
}

const useUserLendingState = create<UserLending>((set) => ({
  userLending: [],
  isLoading: false,
  setLoading: (isLoading: boolean) =>
    set(
      produce((state) => {
        state.isLoading = isLoading;
      })
    ),
  setUserLending: (lending: Lending[]) =>
    set(
      produce((state) => {
        lending.map((nft) => {
          //TODO:eniko remove user lending
          const previousNft = state.userLending[nft.id];
          state.userLending[nft.id] = {
            ...previousNft,
            ...nft
          };
        });
      })
    )
}));

export const useUserIsLending = () => {
  const currentAddress = useCurrentAddress();
  const previousAddress = usePrevious(currentAddress);
  const { signer, network } = useWallet();
  const isLoading = useUserLendingState(
    useCallback((state) => state.isLoading, []),
    shallow
  );
  const userLending = useUserLendingState(
    useCallback((state) => state.userLending, []),
    shallow
  );
  const setUserLending = useUserLendingState((state) => state.setUserLending);
  const setLoading = useUserLendingState((state) => state.setLoading);
  const addNfts = useNftsStore((state) => state.addNfts);

  const fetchLending = useCallback(() => {
    if (!signer) return EMPTY;
    if (!process.env.NEXT_PUBLIC_RENFT_API) {
      throw new Error("RENFT_API is not defined");
    }
    if (network !== process.env.NEXT_PUBLIC_NETWORK_SUPPORTED) {
      if (userLending && userLending.length > 0) setUserLending([]);
      return EMPTY;
    }

    const subgraphURI = process.env.NEXT_PUBLIC_RENFT_API;
    setLoading(true);

    const fetchRequest = from<
      Promise<{
        users: { lending: LendingRaw[] }[];
      }>
    >(
      timeItAsync("Pulled Users ReNFT Lendings", async () => {
        return request(
          subgraphURI,
          queryUserLendingRenft(currentAddress)
        ).catch((e) => {
          // ! let's warn with unique messages, without console logging the error message
          // ! that something went wrong. That way, if the app behaves incorrectly, we will
          // ! know where to look. Right now I am running into an issue of localising the
          // ! problem why user's lending does not show and there is no console.warn here
          console.warn("could not pull users ReNFT lendings");
          return {};
        });
      })
    ).pipe(
      map((response) => {
        if (response && response.users && response.users[0]) {
          return Object.values(response.users[0].lending).filter(
            (v) => v != null
          );
        }
      }),
      map((lendings) => {
        if (!lendings) {
          setLoading(false);
          return;
        }
        const nfts = lendings.map(
          (lendingRaw) =>
            new Nft(
              lendingRaw.nftAddress,
              lendingRaw.tokenId,
              lendingRaw.lentAmount,
              lendingRaw.isERC721
            )
        );
        addNfts(nfts);
        setUserLending(lendings.map((r) => new Lending(r)));
        setLoading(false);
      })
    );
    return fetchRequest;
  }, [
    currentAddress,
    userLending,
    previousAddress,
    signer,
    network,
    setLoading,
    setUserLending
  ]);

  useEffect(() => {
    const subscription = timer(0, 10 * SECOND_IN_MILLISECONDS)
      .pipe(switchMap(fetchLending))
      .subscribe();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [fetchLending, currentAddress]);

  return { userLending, isLoading };
};
