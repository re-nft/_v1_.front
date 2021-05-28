import request from "graphql-request";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import usePoller from "../hooks/usePoller";
import { fetchRenftsAll, ReturnReNftAll } from "../services/graph";
import createCancellablePromise from "./create-cancellable-promise";
import { Lending, Renting } from "./graph/classes";
import UserContext from "./UserProvider";

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
  const {signer} = useContext(UserContext);
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

  usePoller(fetchRenting, 10000);

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
