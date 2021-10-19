import request from "graphql-request";
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";

import { hasDifference, timeItAsync } from "../utils";
import { Lending } from "./graph/classes";
import { queryUserLendingRenft } from "./graph/queries";
import { LendingRaw } from "./graph/types";
import UserContext from "./UserProvider";
import { CurrentAddressWrapper } from "./CurrentAddressWrapper";
import { usePrevious } from "../hooks/usePrevious";
import { SECOND_IN_MILLISECONDS } from "../consts";
import { EMPTY, from, timer, map, switchMap } from "rxjs";
import * as Sentry from "@sentry/nextjs";


export type UserLendingContextType = {
  userLending: Lending[];
  isLoading: boolean;
};
export const UserLendingContext = createContext<UserLendingContextType>({
  userLending: [],
  isLoading: false,
});

UserLendingContext.displayName = "UserLendingContext";

export const UserLendingProvider: React.FC = ({ children }) => {
  const { signer, network } = useContext(UserContext);
  const [lending, setLendings] = useState<Lending[]>([]);
  const [isLoading, setLoading] = useState(false);
  const currentAddress = useContext(CurrentAddressWrapper);
  const previousAddress = usePrevious(currentAddress);

  const fetchLending = useCallback(() => {
    if (!signer) return EMPTY;
    if (!process.env.NEXT_PUBLIC_RENFT_API) {
      throw new Error("RENFT_API is not defined");
    }
    if (network !== process.env.NEXT_PUBLIC_NETWORK_SUPPORTED) {
      if (lending && lending.length > 0) setLendings([]);
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
          Sentry.captureException(e);

          // ! let's warn with unique messages, without console logging the error message
          // ! that something went wrong. That way, if the app behaves incorrectly, we will
          // ! know where to look. Right now I am running into an issue of localising the
          // ! problem why user's lending does not show and there is no console.warn here
          console.warn("could not pull users ReNFT lendings", e);
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
        const normalizedLendings = lending;
        const normalizedLendingNew = lendings;

        const hasDiff = hasDifference(normalizedLendings, normalizedLendingNew);
        if (currentAddress !== previousAddress) {
          setLendings(lendings);
        } else if (hasDiff) {
          setLendings(lendings);
        }
        setLoading(false);
      })
    );
    return fetchRequest;
  }, [currentAddress, lending, previousAddress, signer, network]);

  useEffect(() => {
    const subscription = timer(0, 10 * SECOND_IN_MILLISECONDS)
      .pipe(switchMap(fetchLending))
      .subscribe();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [fetchLending, currentAddress]);

  return (
    <UserLendingContext.Provider
      value={{
        userLending: lending,
        isLoading,
      }}
    >
      {children}
    </UserLendingContext.Provider>
  );
};
