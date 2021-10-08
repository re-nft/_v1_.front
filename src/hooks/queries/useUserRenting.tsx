import { useCallback, useEffect, useState } from "react";
import shallow from "zustand/shallow";

import { EMPTY, from, timer, map, switchMap } from "rxjs";
import { SECOND_IN_MILLISECONDS } from "../../consts";
import { Nft, Renting } from "../../types/classes";
import { fetchUserRenting, FetchUserRentingReturn } from "../../services/graph";
import { parseLending } from "../../utils";
import { useWallet } from "../store/useWallet";
import { useCurrentAddress } from "../misc/useCurrentAddress";
import {
  NFTRentType,
  useNftsStore,
  useRentingStore
} from "../store/useNftStore";
import { usePrevious } from "../misc/usePrevious";
import {
  EventTrackedTransactionStateManager,
  SmartContractEventType,
  useEventTrackedTransactionState
} from "../store/useEventTrackedTransactions";

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
      return pendingLendings.length + pendingStopRentals.length;
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
