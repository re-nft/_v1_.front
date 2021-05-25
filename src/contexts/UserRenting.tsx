import request from "graphql-request";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { SignerContext } from "../hardhat/SymfoniContext";
import { fetchRenftsAll, ReturnReNftAll } from "../services/graph";
import { timeItAsync } from "../utils";
import createCancellablePromise from "./create-cancellable-promise";
import { CurrentAddressContextWrapper } from "./CurrentAddressContextWrapper";
import { Lending, Renting } from "./graph/classes";
import { queryUserLendingRenft } from "./graph/queries";

export type UserRentingContextType = {
  userRenting: Renting[];
  isLoading: boolean;
  refetchRenting: () => (() => void) | undefined;
};
export const UserRentingContext = createContext<UserRentingContextType>({
  userRenting: [],
  isLoading: false,
  refetchRenting: () => {
    return undefined;
  },
});

export const UserRentingProvider: React.FC = ({ children }) => {
  const [renting, setRentings] = useState<Renting[]>([]);
  const [signer] = useContext(SignerContext);
  const [isLoading, setLoading] = useState(false);

  const fetchRenting = useCallback(() => {
    if (!signer) return;
    setLoading(true);
    const fetchRequest = createCancellablePromise<ReturnReNftAll | undefined>(
      fetchRenftsAll(signer)
    );
    fetchRequest.promise
      .then((renftAll) => {
        if (renftAll) setRentings(Object.values(renftAll.renting) || []);
      })
      .finally(() => {
        setLoading(false);
      });
    return fetchRequest.cancel;
  }, [signer]);

  useEffect(() => {
    fetchRenting();
  }, [fetchRenting]);

  return (
    <UserRentingContext.Provider
      value={{
        userRenting: renting,
        isLoading,
        refetchRenting: fetchRenting,
      }}
    >
      {children}
    </UserRentingContext.Provider>
  );
};
