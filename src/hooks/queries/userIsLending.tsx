import produce from "immer";
import shallow from "zustand/shallow";
import create from "zustand";

import { Lending } from "../../contexts/graph/classes";
import { useCallback, useContext, useEffect } from "react";
import { usePrevious } from "../usePrevious";
import UserContext from "../../contexts/UserProvider";
import { CurrentAddressWrapper } from "../../contexts/CurrentAddressWrapper";
import { SECOND_IN_MILLISECONDS } from "../../consts";
import { EMPTY, from, map, switchMap, timer } from "rxjs";
import { hasDifference, timeItAsync } from "../../utils";
import { LendingRaw } from "../../contexts/graph/types";
import request from "graphql-request";
import { queryUserLendingRenft } from "../../contexts/graph/queries";

interface UserLending {
  userLending: Lending[];
  isLoading: false;
  setUserLending: (arr: Lending[]) => void;
  setLoading: (b: boolean) => void;
}

const useUserLendingState = create<UserLending>((set, get) => ({
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
        state.userLending = lending;
      })
    ),
}));

export const useUserIsLending = () => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const previousAddress = usePrevious(currentAddress);
  const { signer, network } = useContext(UserContext);
  const setLoading = useUserLendingState((state) => state.setLoading, shallow);
  const setUserLending = useUserLendingState(
    (state) => state.setUserLending,
    shallow
  );
  const userLending = useUserLendingState(
    (state) => state.userLending,
    shallow
  );
  const isLoading = useUserLendingState((state) => state.isLoading, shallow);
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
          return Object.values(response.users[0].lending)
            .filter((v) => v != null)
            .map((lending) => {
              return new Lending(lending);
            });
        }
      }),
      map((lendings) => {
        if (!lendings) {
          setLoading(false);
          return;
        }
        const normalizedLendings = userLending;
        const normalizedLendingNew = lendings;

        const hasDiff = hasDifference(normalizedLendings, normalizedLendingNew);
        if (currentAddress !== previousAddress) {
          setUserLending(lendings);
        } else if (hasDiff) {
          setUserLending(lendings);
        }
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
    setUserLending,
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
