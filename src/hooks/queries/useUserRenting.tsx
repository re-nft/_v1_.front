import { useCallback, useEffect, useMemo, useState } from "react";
import shallow from "zustand/shallow";

import { EMPTY, from, timer, map, switchMap } from "rxjs";
import { SECOND_IN_MILLISECONDS } from "../../consts";
import { Nft, Renting } from "../../types/classes";
import { fetchUserRenting, FetchUserRentingReturn } from "../../services/graph";
import { parseLending } from "../../utils";
import { usePrevious } from "../misc/usePrevious";
import { useWallet } from "../store/useWallet";
import { useCurrentAddress } from "../misc/useCurrentAddress";
import { useNftsStore, useRentingStore } from "../store/useNftStore";

export const useUserRenting = () => {
  const { signer, network } = useWallet();
  const currentAddress = useCurrentAddress();
  const previousAddress = usePrevious(currentAddress);

  const [isLoading, setLoading] = useState(false);
  const addNfts = useNftsStore((state) => state.addNfts);
  const addRentings = useRentingStore((state) => state.addRentings);
  const rentings = useRentingStore(
    useCallback((state) => state.rentings, []),
    shallow
  );

  const fetchRenting = useCallback(() => {
    if (!currentAddress || !signer) return EMPTY;
    if (network !== process.env.NEXT_PUBLIC_NETWORK_SUPPORTED) {
      if (rentings && Object.keys(rentings).length > 0) addRentings([]);
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
            if (Object.keys(rentings).length > 0) addRentings([]);
            setLoading(false);
            return EMPTY;
          }
          if (users.length < 1) {
            if (Object.keys(rentings).length > 0) addRentings([]);
            setLoading(false);
            return EMPTY;
          }
          const firstMatch = users[0];
          const { renting: r } = firstMatch;
          if (!r) {
            if (Object.keys(rentings).length > 0) addRentings([]);
            return;
          }
          const nfts = r.map(
            (r) =>
              new Nft(
                r.lending.nftAddress,
                r.lending.tokenId,
                r.lending.lentAmount,
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
          addRentings(_renting);
          setLoading(false);
        }
      })
    );
    return fetchRequest;
  }, [
    currentAddress,
    previousAddress,
    rentings,
    signer,
    network,
    setLoading,
    addRentings
  ]);

  useEffect(() => {
    const subscription = timer(0, 10 * SECOND_IN_MILLISECONDS)
      .pipe(switchMap(fetchRenting))
      .subscribe();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [fetchRenting, currentAddress]);

  const renting = useMemo(() => {
    return Object.values(rentings);
  }, [rentings]);

  return { renting, isLoading };
};
