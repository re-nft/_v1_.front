import { useCallback, useEffect, useState } from "react";
import shallow from "zustand/shallow";

import { EMPTY, from, timer, map, switchMap, catchError, of } from "rxjs";
import { SECOND_IN_MILLISECONDS } from "renft-front/consts";
import { Nft, Renting } from "renft-front/types/classes";
import {
  fetchUserRenting,
  FetchUserRentingReturn,
} from "renft-front/services/graph";
import { parseLending } from "renft-front/utils";
import { useWallet } from "renft-front/hooks/store/useWallet";
import { useCurrentAddress } from "renft-front/hooks/misc/useCurrentAddress";
import {
  NFTRentType,
  useNftsStore,
  useRentingStore,
} from "renft-front/hooks/store/useNftStore";
import { usePrevious } from "renft-front/hooks/misc/usePrevious";
import {
  EventTrackedTransactionStateManager,
  SmartContractEventType,
  useEventTrackedTransactionState,
} from "renft-front/hooks/store/useEventTrackedTransactions";

import * as Sentry from "@sentry/nextjs";

export const useUserRenting = (): {
  isLoading: boolean;
  renting: Renting[];
} => {
  const { signer, network } = useWallet();
  const currentAddress = useCurrentAddress();
  const previousAddress = usePrevious(currentAddress);
  const refetchAfterOperation = useEventTrackedTransactionState(
    useCallback((state: EventTrackedTransactionStateManager) => {
      const pendingStopRentals =
        state.pendingTransactions[SmartContractEventType.START_RENT];
      const pendingLendings =
        state.pendingTransactions[SmartContractEventType.RETURN_RENTAL];
      // refetch will change when you start renting goes from non-empty array to empty array
      return pendingLendings.length * 1 + pendingStopRentals.length * 2;
    }, []),
    shallow
  );
  const [isLoading, setLoading] = useState(false);
  const addNfts = useNftsStore(useCallback((state) => state.addNfts, []));
  const addRentings = useRentingStore(
    useCallback((state) => state.addRentings, [])
  );
  const renting = useRentingStore(
    useCallback((state) => state.userRenting, []),
    shallow
  );

  const fetchRenting = useCallback(() => {
    if (!currentAddress || !signer) return EMPTY;
    if (network !== process.env.NEXT_PUBLIC_NETWORK_SUPPORTED) {
      addRentings([], NFTRentType.USER_IS_RENTING);
      return EMPTY;
    }
    setLoading(true);
    const fetchRequest = from<Promise<FetchUserRentingReturn | undefined>>(
      fetchUserRenting(currentAddress)
    ).pipe(
      map((usersRenting) => {
        if (usersRenting) {
          const { users } = usersRenting;
          if (!users || users.length < 1) {
            addRentings([], NFTRentType.USER_IS_RENTING);
            setLoading(false);
            return EMPTY;
          }
          const firstMatch = users[0];
          const { renting: r } = firstMatch;
          if (!r || r.length < 1) {
            addRentings([], NFTRentType.USER_IS_RENTING);
            setLoading(false);
            return EMPTY;
          }
          const nfts = r.map(
            (r) =>
              new Nft(
                r.lending.nftAddress,
                r.lending.tokenId,
                r.lending.isERC721
              )
          );
          addNfts(nfts);
          const _renting: Renting[] = r
            .filter((v) => v.lending && !v.lending.collateralClaimed)
            .map(
              (r) =>
                new Renting(
                  r.lending.nftAddress,
                  r.lending.tokenId,
                  parseLending(r.lending),
                  r
                )
            );
          addRentings(_renting, NFTRentType.USER_IS_RENTING);
          setLoading(false);
        }
      }),
      catchError((e) => {
        //TODO:eniko dev test
        Sentry.captureException(e);
        setLoading(false);
        return of();
      })
    );
    return fetchRequest;
  }, [currentAddress, signer, network, addRentings, addNfts]);

  useEffect(() => {
    const start = refetchAfterOperation ? 0 : 0;
    const subscription = timer(start, 30 * SECOND_IN_MILLISECONDS)
      .pipe(switchMap(fetchRenting))
      .subscribe();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [fetchRenting, refetchAfterOperation]);

  // reset on wallet change
  useEffect(() => {
    addRentings([], NFTRentType.USER_IS_RENTING);
  }, [currentAddress, previousAddress, addRentings]);
  return { renting, isLoading };
};
