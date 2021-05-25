import request from "graphql-request";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import {
  CurrentAddressContext,
  SignerContext,
} from "../hardhat/SymfoniContext";
import { timeItAsync } from "../utils";
import createCancellablePromise from "./create-cancellable-promise";
import { CurrentAddressContextWrapper } from "./CurrentAddressContextWrapper";
import { Lending } from "./graph/classes";
import { queryUserLendingRenft } from "./graph/queries";
import { LendingRaw } from "./graph/types";

export type UserLendingContextType = {
    userLending: Lending[],
    isLoading: boolean,
    refetchLending: () => (() => void) | undefined;
}
export const UserLendingContext = createContext<UserLendingContextType>({
    userLending: [],
    isLoading: false,
    refetchLending: () => {
        return undefined;
    }
});

export const UserLendingProvider: React.FC = ({ children }) => {
  const [currentAddress] = useContext(CurrentAddressContextWrapper);
  const [signer] = useContext(SignerContext);
  const [lending, setLendings] = useState<Lending[]>([]);
  const [isLoading, setLoading] = useState(false);

  const fetchLending = useCallback(() => {
    if (!signer) return;
    if (!currentAddress) return;
    if (!process.env.REACT_APP_RENFT_API) {
      throw new Error("RENFT_API is not defined");
    }
    const subgraphURI = process.env.REACT_APP_RENFT_API;
    setLoading(true);
    const fetchRequest = createCancellablePromise<{ users: { lending: LendingRaw[] }[] }>(
      timeItAsync(
        "Pulled Users ReNFT Lendings",
        async () =>
          await request(
            subgraphURI,
            queryUserLendingRenft(currentAddress)
          ).catch((e) => {
            return {};
          })
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
  }, [signer, currentAddress]);

  useEffect(() => {
    fetchLending();
  }, [fetchLending]);

  return (
    <UserLendingContext.Provider
      value={{
        userLending: lending,
        isLoading,
        refetchLending: fetchLending,
      }}
    >
      {children}
    </UserLendingContext.Provider>
  );
};