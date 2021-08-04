import request from "graphql-request";
import { useContext, useEffect, useMemo } from "react";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import { Lending, Nft } from "../contexts/graph/classes";
import { queryAllLendingRenft } from "../contexts/graph/queries";
import { timeItAsync } from "../utils";
import UserContext from "../contexts/UserProvider";
import { SECOND_IN_MILLISECONDS } from "../consts";
import { debounceTime, EMPTY, from, map, switchMap, timer } from "rxjs";
import { LendingRaw } from "../contexts/graph/types";
import shallow from "zustand/shallow";
import create from "zustand";

const fetchRentings = () => {
  if (!process.env.NEXT_PUBLIC_RENFT_API) {
    throw new Error("RENFT_API is not defined");
  }
  const subgraphURI = process.env.NEXT_PUBLIC_RENFT_API;
  return from<Promise<{ lendings: LendingRaw[] }>>(
    timeItAsync(
      "Pulled All ReNFT Lendings",
      async () =>
        await request(subgraphURI, queryAllLendingRenft).catch(() => {
          console.warn("could not pull all ReNFT lendings");
          return {};
        })
    )
  ).pipe(
    map((response) => Object.values(response?.lendings || [])),
    map((lendings) => {
      return lendings
        .filter((v) => !v.renting)
        .filter((v) => v != null)
        .map((lending) => {
          return new Lending(lending);
        });
    })
  );
};

interface allAvailableForRent {
  isLoading: boolean;
  nfts: Lending[];
  setNfts: (nfts: Lending[]) => void;
  setLoading: (loading: boolean) => void;
}

const useAllAvailableStore = create<allAvailableForRent>((set, get) => ({
  isLoading: false,
  nfts: [],
  setNfts: (items: Lending[]) =>
    set((state) => {
      const previousNfts = state.nfts || [];
      const map = items.reduce((acc, item) => {
        acc.set(item.id, item);
        return acc;
      }, new Map<string, Nft>());
      let nfts = [];
      if (previousNfts.length === 0 || items.length === 0) {
        nfts = items;
      } else {
        nfts = previousNfts.filter((item) => {
          return map.has(item.id);
        });
      }
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
  const { network } = useContext(UserContext);
  const currentAddress = useContext(CurrentAddressWrapper);
  const nfts = useAllAvailableStore((state) => state.nfts, shallow);
  const isLoading = useAllAvailableStore((state) => state.isLoading, shallow);
  const setNfts = useAllAvailableStore((state) => state.setNfts, shallow);
  const setLoading = useAllAvailableStore((state) => state.setLoading, shallow);

  useEffect(() => {
    const subscription = timer(0, 10 * SECOND_IN_MILLISECONDS)
      .pipe(
        switchMap(() => {
          if (network !== process.env.NEXT_PUBLIC_NETWORK_SUPPORTED) {
            if (nfts && nfts.length > 0) return [];
            return [];
          }
          setLoading(true);
          return fetchRentings();
        }),
        map((items) => {
          if(items) setNfts(items);
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
  }, [fetchRentings, currentAddress, setLoading, network]);

  const allAvailableToRent = useMemo(() => {
    if (!currentAddress) return nfts;
    return nfts.filter((l: Lending) => {
      // empty address show all renting
      // ! not equal. if lender address === address, then that means we have lent the item, and now want to rent our own item
      // ! therefore, this check is !==
      const userNotLender =
        l.lending.lenderAddress.toLowerCase() !== currentAddress.toLowerCase();
      const userNotRenter =
        l.renting && l.renting.renterAddress
          ? l.renting.renterAddress.toLowerCase() !== currentAddress
          : true;
      return userNotLender && userNotRenter;
    });
  }, [currentAddress, nfts]);

  return { allAvailableToRent, isLoading };
};
