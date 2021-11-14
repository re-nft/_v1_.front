import { useCallback, useEffect, useMemo, useState } from "react";
import request from "graphql-request";
import { Lending, Nft } from "renft-front/types/classes";
import { queryAllLendingRenft } from "renft-front/services/queries";
import { timeItAsync } from "renft-front/utils";
import {
  SECOND_IN_MILLISECONDS,
  RENFT_REFETCH_INTERVAL,
} from "renft-front/consts";
import { debounceTime, from, map, Observable, switchMap, timer } from "rxjs";
import { LendingRaw } from "renft-front/types";
import shallow from "zustand/shallow";
import { useWallet } from "renft-front/hooks/store/useWallet";
import { useCurrentAddress } from "renft-front/hooks/misc/useCurrentAddress";
import {
  NFTRentType,
  useLendingStore,
  useNftsStore,
} from "renft-front/hooks/store/useNftStore";
import { usePrevious } from "renft-front/hooks/misc/usePrevious";
import {
  EventTrackedTransactionStateManager,
  SmartContractEventType,
  useEventTrackedTransactionState,
} from "renft-front/hooks/store/useEventTrackedTransactions";
import * as Sentry from "@sentry/nextjs";

export const fetchRentings = (): Observable<LendingRaw[]> => {
  if (!process.env.NEXT_PUBLIC_RENFT_API) {
    throw new Error("RENFT_API is not defined");
  }
  const subgraphURI = process.env.NEXT_PUBLIC_RENFT_API;
  return from<Promise<{ lendings: LendingRaw[] }>>(
    timeItAsync("Pulled All ReNFT Lendings", async () =>
      request(subgraphURI, queryAllLendingRenft).catch((e) => {
        //TODO:eniko sentry loggin
        Sentry.captureException(e);
        //TODO:eniko ui error dialog

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

export const useAllAvailableForRent = (): {
  isLoading: boolean;
  allAvailableToRent: Lending[];
} => {
  const { network } = useWallet();
  const [isLoading, setLoading] = useState(false);
  const currentAddress = useCurrentAddress();
  const previousAddress = usePrevious(currentAddress);
  const refetchAfterOperation = useEventTrackedTransactionState(
    useCallback((state: EventTrackedTransactionStateManager) => {
      const pendingRentings =
        state.pendingTransactions[SmartContractEventType.START_RENT];
      const pendingLendings =
        state.pendingTransactions[SmartContractEventType.START_LEND];
      const pendingRentals =
        state.pendingTransactions[SmartContractEventType.STOP_LEND];
      return (
        pendingRentings.length * 2 +
        pendingLendings.length * 3 +
        pendingRentals.length * 4
      );
    }, []),
    shallow
  );
  const allLendings = useLendingStore(
    useCallback((state) => state.lendings, []),
    shallow
  );

  const addNfts = useNftsStore(useCallback((state) => state.addNfts, []));
  const addLendings = useLendingStore(
    useCallback((state) => state.addLendings, [])
  );
  const allAvailableToRentIds = useLendingStore(
    useCallback((state) => state.allAvailableToRent, []),
    shallow
  );
  useEffect(() => {
    // stupid way to force refetch
    const start = refetchAfterOperation ? 0 : 0;
    const subscription = timer(start, RENFT_REFETCH_INTERVAL)
      .pipe(
        switchMap(() => {
          if (
            network &&
            network !== process.env.NEXT_PUBLIC_NETWORK_SUPPORTED
          ) {
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
                lendingRaw.isERC721
              )
          );
          addNfts(nfts);
          addLendings(
            items.map((r) => new Lending(r)),
            NFTRentType.ALL_AVAILABLE_TO_RENT
          );
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
  }, [
    currentAddress,
    setLoading,
    network,
    addLendings,
    addNfts,
    refetchAfterOperation,
  ]);

  const allAvailableToRent = useMemo(() => {
    if (!currentAddress) return Object.values(allLendings);
    const userNotRenter = (l: Lending) => {
      const userNotRenter = l.renterAddress.toLowerCase() !== currentAddress;
      return userNotRenter;
    };
    const arr: Lending[] = allAvailableToRentIds
      .map((i) => {
        return allLendings[i];
      })
      .filter(userNotRenter);
    return arr;
  }, [currentAddress, allLendings, allAvailableToRentIds]);

  // reset on wallet change
  useEffect(() => {
    addLendings([], NFTRentType.ALL_AVAILABLE_TO_RENT);
  }, [currentAddress, previousAddress, addLendings]);

  return { allAvailableToRent, isLoading };
};
