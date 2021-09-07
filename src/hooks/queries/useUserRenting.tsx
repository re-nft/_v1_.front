import { useCallback, useEffect } from "react";
import produce from "immer";
import shallow from "zustand/shallow";
import create from "zustand";

import { EMPTY, from, timer, map, switchMap } from "rxjs";
import { SECOND_IN_MILLISECONDS } from "../../consts";
import { Renting } from "../../types/classes";
import { fetchUserRenting, FetchUserRentingReturn } from "../../services/graph";
import { hasDifference, parseLending } from "../../utils";
import { usePrevious } from "../usePrevious";
import { useWallet } from "../useWallet";
import { useCurrentAddress } from "../useCurrentAddress";

export type UserRentingState = {
  userRenting: Renting[];
  isLoading: boolean;
  setRenting: (r: Renting[]) => void;
  setLoading: (r: boolean) => void;
};

const useUserRentingState = create<UserRentingState>((set) => ({
  userRenting: [],
  isLoading: false,
  setLoading: (isLoading: boolean) =>
    set(
      produce((state) => {
        state.isLoading = isLoading;
      })
    ),
  setRenting: (r: Renting[]) =>
    set(
      produce((state) => {
        state.userRenting = r;
      })
    ),
}));

export const useUserRenting = () => {
  const { signer, network } = useWallet();
  const currentAddress = useCurrentAddress();
  const previousAddress = usePrevious(currentAddress);
  const renting = useUserRentingState((state) => state.userRenting, shallow);
  const setRentings = useUserRentingState((state) => state.setRenting, shallow);
  const setLoading = useUserRentingState((state) => state.setLoading, shallow);
  const isLoading = useUserRentingState((state) => state.isLoading, shallow);

  const fetchRenting = useCallback(() => {
    if (!currentAddress || !signer) return EMPTY;
    if (network !== process.env.NEXT_PUBLIC_NETWORK_SUPPORTED) {
      if (renting && renting.length > 0) setRentings([]);
      return EMPTY;
    }
    setLoading(true);
    const fetchRequest = from<Promise<FetchUserRentingReturn | undefined>>(
      fetchUserRenting(currentAddress)
    ).pipe(
      map((usersRenting) => {
        if (usersRenting) {
          const { users } = usersRenting;
          if (!users) {
            if (renting.length > 0) setRentings([]);
            setLoading(false);
            return EMPTY;
          }
          if (users.length < 1) {
            if (renting.length > 0) setRentings([]);
            setLoading(false);
            return EMPTY;
          }
          const firstMatch = users[0];
          const { renting: r } = firstMatch;
          if (!r) {
            if (renting.length > 0) setRentings([]);
            return;
          }
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
          const normalizedLendings = renting;
          const normalizedLendingNew = _renting;

          const hasDiff = hasDifference(
            normalizedLendings,
            normalizedLendingNew
          );
          if (currentAddress !== previousAddress) {
            setRentings(_renting);
          } else if (hasDiff) {
            setRentings(_renting);
          }
          setLoading(false);
        }
      })
    );
    return fetchRequest;
  }, [
    currentAddress,
    previousAddress,
    renting,
    signer,
    network,
    setLoading,
    setRentings,
  ]);

  useEffect(() => {
    const subscription = timer(0, 10 * SECOND_IN_MILLISECONDS)
      .pipe(switchMap(fetchRenting))
      .subscribe();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [fetchRenting, currentAddress]);

  return { renting, isLoading };
};
