import { Lending, Nft, Renting } from "renft-front/types/classes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrevious } from "renft-front/hooks/misc/usePrevious";
import { SECOND_IN_MILLISECONDS } from "renft-front/consts";
import { EMPTY, from, map, switchMap, timer } from "rxjs";
import { parseLending, timeItAsync } from "renft-front/utils";
import { LendingRaw } from "renft-front/types";
import request from "graphql-request";
import { queryUserLendingRenft } from "renft-front/services/queries";
import { useWallet } from "renft-front/hooks/store/useWallet";
import { useCurrentAddress } from "renft-front/hooks/misc/useCurrentAddress";
import {
  NFTRentType,
  useLendingStore,
  useNftsStore,
  useRentingStore,
} from "renft-front/hooks/store/useNftStore";
import shallow from "zustand/shallow";
import {
  EventTrackedTransactionStateManager,
  SmartContractEventType,
  useEventTrackedTransactionState,
} from "renft-front/hooks/store/useEventTrackedTransactions";
import * as Sentry from "@sentry/nextjs";

export const useUserIsLending = (): {
  isLoading: boolean;
  userLending: Lending[];
} => {
  const currentAddress = useCurrentAddress();
  const previousAddress = usePrevious(currentAddress);
  const { signer, network } = useWallet();
  const [isLoading, setLoading] = useState(false);
  const refetchAfterOperation = useEventTrackedTransactionState(
    useCallback((state: EventTrackedTransactionStateManager) => {
      const pendingStopRentals =
        state.pendingTransactions[SmartContractEventType.STOP_LEND];
      const pendingLendings =
        state.pendingTransactions[SmartContractEventType.START_LEND];
      const claimLendings =
        state.pendingTransactions[SmartContractEventType.CLAIM];
      // refetch will change when you start renting goes from non-empty array to empty array
      return (
        pendingLendings.length +
        pendingStopRentals.length +
        claimLendings.length
      );
    }, []),
    shallow
  );

  const addNfts = useNftsStore(useCallback((state) => state.addNfts, []));
  const addLendings = useLendingStore(
    useCallback((state) => state.addLendings, [])
  );
  const addRentings = useRentingStore(
    useCallback((state) => state.addRentings, [])
  );
  const lendings = useLendingStore(
    useCallback((state) => state.lendings, []),
    shallow
  );
  const userIsLendingIds = useLendingStore(
    useCallback((state) => state.userIsLending, []),
    shallow
  );

  const fetchLending = useCallback(() => {
    if (!signer) return EMPTY;
    if (!process.env.NEXT_PUBLIC_RENFT_API) {
      throw new Error("RENFT_API is not defined");
    }
    if (network !== process.env.NEXT_PUBLIC_NETWORK_SUPPORTED) {
      if (userIsLendingIds && userIsLendingIds.length > 0)
        addLendings([], NFTRentType.USER_IS_LENDING);
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
          //TODO:eniko sentry loggin
          Sentry.captureException(e);
          //TODO:eniko ui error dialog
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
              lendingRaw.isERC721
            )
        );
        addNfts(nfts);
        addLendings(
          lendings.map((r) => new Lending(r)),
          NFTRentType.USER_IS_LENDING
        );
        addRentings(
          lendings
            .filter((r) => r.renting)
            .map(
              (r: LendingRaw) =>
                new Renting(r.tokenId, r.nftAddress, parseLending(r), r.renting)
            ),
          NFTRentType.USER_IS_LENDING
        );
        setLoading(false);
      })
    );
    return fetchRequest;
  }, [
    signer,
    network,
    userIsLendingIds,
    addLendings,
    currentAddress,
    addNfts,
    addRentings,
  ]);

  useEffect(() => {
    // stupid way to force refetch
    const start = refetchAfterOperation ? 0 : 0;
    const subscription = timer(start, 30 * SECOND_IN_MILLISECONDS)
      .pipe(switchMap(fetchLending))
      .subscribe();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [fetchLending, currentAddress, refetchAfterOperation]);

  const userLending = useMemo(() => {
    return userIsLendingIds.map((i) => {
      return lendings[i];
    });
  }, [userIsLendingIds, lendings]);

  // reset on wallet change
  useEffect(() => {
    addLendings([], NFTRentType.USER_IS_LENDING);
  }, [currentAddress, previousAddress, addLendings]);

  return { userLending, isLoading };
};
