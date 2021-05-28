import request from "graphql-request";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { SignerContext } from "../hardhat/SymfoniContext";
import usePoller from "../hooks/usePoller";
import { timeItAsync } from "../utils";
import createCancellablePromise from "./create-cancellable-promise";
import { Lending } from "./graph/classes";
import { queryUserLendingRenft } from "./graph/queries";
import { LendingRaw } from "./graph/types";

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
  const [signer] = useContext(SignerContext);
  const [lending, setLendings] = useState<Lending[]>([]);
  const [isLoading, setLoading] = useState(false);

  const fetchLending = useCallback(async () => {
    if (!signer) return;
    if (!process.env.REACT_APP_RENFT_API) {
      throw new Error("RENFT_API is not defined");
    }

    const subgraphURI = process.env.REACT_APP_RENFT_API;
    setLoading(true);
    const address = await signer.getAddress();
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
          setLendings(lendings);
        }
      })
      .finally(() => {
        setLoading(false);
      });
    return fetchRequest.cancel;
  }, [signer]);

  useEffect(() => {
    fetchLending();
  }, [fetchLending]);

  usePoller(fetchLending, 10000);

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
