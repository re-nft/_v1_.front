import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { CurrentAddressContext, SignerContext } from "../hardhat/SymfoniContext";
import usePoller from "../hooks/usePoller";
import { fetchUserRenting, FetchUserRentingReturn } from "../services/graph";
import createCancellablePromise from "./create-cancellable-promise";
import { Renting } from "./graph/classes";
import { parseLending } from "./graph/utils";

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
  const [currAddress] = useContext(CurrentAddressContext);
  const [isLoading, setLoading] = useState(false);

  const fetchRenting = useCallback(() => {
    if (!currAddress || !signer) return;
    setLoading(true);
    const fetchRequest = createCancellablePromise<FetchUserRentingReturn | undefined>(
      fetchUserRenting(currAddress)
    );
    fetchRequest.promise
      .then((usersRenting) => {
        if (usersRenting) {
          const { users } = usersRenting;
          if (!users) return;
          const firstMatch = users[0];
          const { renting } = firstMatch;
          if (!renting) return;
          const _renting: Renting[] = [];
          renting.forEach((r) => {
            _renting.push(new Renting(r.lending.nftAddress, r.lending.tokenId, parseLending(r.lending), r, signer));
          });
          setRentings(_renting);
        }
      })
      .finally(() => {
        setLoading(false);
      });
    return fetchRequest.cancel;
  }, [currAddress, signer]);

  useEffect(() => {
    fetchRenting();
  }, [fetchRenting]);

  usePoller(fetchRenting, 5_000);

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
