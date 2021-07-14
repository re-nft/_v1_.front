import request from "graphql-request";
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect
} from "react";

import { timeItAsync } from "../utils";
import createCancellablePromise from "./create-cancellable-promise";
import { Lending } from "./graph/classes";
import { queryUserLendingRenft } from "./graph/queries";
import { LendingRaw } from "./graph/types";
import { diffJson } from "diff";
import usePoller from "../hooks/usePoller";
import UserContext from "./UserProvider";
import { CurrentAddressWrapper } from "./CurrentAddressWrapper";
import { usePrevious } from "../hooks/usePrevious";
import { SECOND_IN_MILLISECONDS } from "../consts";

export type UserLendingContextType = {
  userLending: Lending[];
  isLoading: boolean;
};
export const UserLendingContext = createContext<UserLendingContextType>({
  userLending: [],
  isLoading: false
});

UserLendingContext.displayName = "UserLendingContext";

export const UserLendingProvider: React.FC = ({ children }) => {
  const { signer, network } = useContext(UserContext);
  const [lending, setLendings] = useState<Lending[]>([]);
  const [isLoading, setLoading] = useState(false);
  const currentAddress = useContext(CurrentAddressWrapper);
  const previousAddress = usePrevious(currentAddress);

  const fetchLending = useCallback(async () => {
    if (!signer) return;
    if (!process.env.REACT_APP_RENFT_API) {
      throw new Error("RENFT_API is not defined");
    }
    if (network !== process.env.REACT_APP_NETWORK_SUPPORTED) {
      if (lending && lending.length > 0) setLendings([]);
      return;
    }

    const subgraphURI = process.env.REACT_APP_RENFT_API;
    setLoading(true);
    const address = await signer.getAddress().catch(() => {
      // on disconnect
      return "";
    });
    const fetchRequest = createCancellablePromise<{
      users: { lending: LendingRaw[] }[];
    }>(
      timeItAsync(
        "Pulled Users ReNFT Lendings",
        async () =>
          await request(subgraphURI, queryUserLendingRenft(address)).catch(
            () => {
              // ! let's warn with unique messages, without console logging the error message
              // ! that something went wrong. That way, if the app behaves incorrectly, we will
              // ! know where to look. Right now I am running into an issue of localising the
              // ! problem why user's lending does not show and there is no console.warn here
              console.warn("could not pull users ReNFT lendings");
              return {};
            }
          )
      )
    );

    fetchRequest.promise
      .then((response) => {
        if (response && response.users && response.users[0]) {
          const lendings = Object.values(response.users[0].lending)
            .filter((v) => v != null)
            .map((lending) => {
              return new Lending(lending, signer);
            });

          const normalizedLendings = lending.map((lending) => lending.toJSON());
          const normalizedLendingNew = lendings.map((lending) =>
            lending.toJSON()
          );

          const difference = diffJson(
            normalizedLendings,
            normalizedLendingNew,
            { ignoreWhitespace: true }
          );
          if (currentAddress !== previousAddress) {
            setLendings(lendings);
          } else if (
            difference &&
            difference[1] &&
            (difference[1].added || difference[1].removed)
          ) {
            setLendings(lendings);
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
    return fetchRequest.cancel;
  }, [currentAddress, lending, previousAddress, signer, network]);

  useEffect(() => {
    fetchLending();
  }, [fetchLending]);

  usePoller(fetchLending, 10 * SECOND_IN_MILLISECONDS, [currentAddress]);

  return (
    <UserLendingContext.Provider
      value={{
        userLending: lending,
        isLoading
      }}
    >
      {children}
    </UserLendingContext.Provider>
  );
};
