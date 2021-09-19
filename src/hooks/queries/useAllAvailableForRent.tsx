import request from "graphql-request";
import { useCallback, useEffect, useMemo } from "react";
import { Lending, Nft } from "../../types/classes";
import { queryAllLendingRenft } from "../../services/queries";
import { timeItAsync } from "../../utils";
import { SECOND_IN_MILLISECONDS } from "../../consts";
import { debounceTime, from, map, Observable, switchMap, timer } from "rxjs";
import { LendingRaw } from "../../types";
import shallow from "zustand/shallow";
import create from "zustand";
import { useWallet } from "../store/useWallet";
import { useCurrentAddress } from "../misc/useCurrentAddress";
import { useNftsStore } from "../store/useNftStore";

export const fetchRentings = (): Observable<LendingRaw[]> => {
  if (!process.env.NEXT_PUBLIC_RENFT_API) {
    throw new Error("RENFT_API is not defined");
  }
  const subgraphURI = process.env.NEXT_PUBLIC_RENFT_API;
  return from<Promise<{ lendings: LendingRaw[] }>>(
    timeItAsync("Pulled All ReNFT Lendings", async () =>
      request(subgraphURI, queryAllLendingRenft).catch(() => {
        console.warn("could not pull all ReNFT lendings");
        return {};
      })
    )
  ).pipe(
    map((response) => Object.values(response?.lendings || [])),
    map((lendings) => {
      return lendings.filter((v) => !v.renting).filter((v) => v != null);
    })
  );
};

interface allAvailableForRent {
  isLoading: boolean;
  nfts: Lending[];
  setNfts: (nfts: Lending[]) => void;
  setLoading: (loading: boolean) => void;
}

const useAllAvailableStore = create<allAvailableForRent>((set) => ({
  isLoading: false,
  nfts: [],
  setNfts: (nfts: Lending[]) =>
    set((state) => {
      return {
        ...state,
        nfts
      };
    }),
  setLoading: (isLoading: boolean) =>
    set((state) => {
      return {
        ...state,
        isLoading
      };
    })
}));

export const useAllAvailableForRent = () => {
  const { network } = useWallet();
  const currentAddress = useCurrentAddress();
  const nfts = useAllAvailableStore(
    useCallback((state) => state.nfts, []),
    shallow
  );
  const isLoading = useAllAvailableStore(
    useCallback((state) => state.isLoading, []),
    shallow
  );
  const setNfts = useAllAvailableStore((state) => state.setNfts);
  const setLoading = useAllAvailableStore((state) => state.setLoading);
  const addNfts = useNftsStore((state) => state.addNfts);

  useEffect(() => {
    const subscription = timer(0, 10 * SECOND_IN_MILLISECONDS)
      .pipe(
        switchMap(() => {
          if (
            network &&
            network !== process.env.NEXT_PUBLIC_NETWORK_SUPPORTED
          ) {
            if (nfts && nfts.length > 0) return [];
            return [];
          }
          setLoading(true);
          return fetchRentings();
        }),
        map((items) => {
          const nfts = items.map(
            (lendingRaw) =>
              new Nft(
                lendingRaw.nftAddress,
                lendingRaw.tokenId,
                lendingRaw.lentAmount,
                lendingRaw.isERC721
              )
          );
          addNfts(nfts);
          if (items) setNfts(items.map((r) => new Lending(r)));
        }),
        debounceTime(SECOND_IN_MILLISECONDS),
        map(() => {
          setLoading(false);
        })
      )
      .subscribe();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [currentAddress, setLoading, network, nfts, setNfts, addNfts]);

  const allAvailableToRent = useMemo(() => {
    if (!currentAddress) return nfts;
    return nfts.filter((l: Lending) => {
      // empty address show all renting
      // ! not equal. if lender address === address, then that means we have lent the item, and now want to rent our own item
      // ! therefore, this check is !==
      const userNotLender =
        l.lenderAddress.toLowerCase() !== currentAddress.toLowerCase();
      const userNotRenter = l.lenderAddress.toLowerCase() !== currentAddress
      return userNotLender && userNotRenter;
    });
  }, [currentAddress, nfts]);

  return { allAvailableToRent, isLoading };
};
