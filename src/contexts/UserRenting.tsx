import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { SignerContext } from "../hardhat/SymfoniContext";
import usePoller from "../hooks/usePoller";
import { fetchUserRenting, FetchUserRentingReturn } from "../services/graph";
import createCancellablePromise from "./create-cancellable-promise";
import { CurrentAddressWrapper } from "./CurrentAddressWrapper";
import { Renting } from "./graph/classes";
import { parseLending } from "./graph/utils";
import { diffJson } from "diff";

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
  const currAddress = useContext(CurrentAddressWrapper);
  const [isLoading, setLoading] = useState(false);

  const fetchRenting = useCallback(() => {
    if (!currAddress || !signer) return;
    setLoading(true);
    const fetchRequest = createCancellablePromise<
      FetchUserRentingReturn | undefined
    >(fetchUserRenting(currAddress));
    fetchRequest.promise
      .then((usersRenting) => {
        if (usersRenting) {
          const { users } = usersRenting;
          if (!users) {
            setRentings([]);
            return;
          }
          if (users.length < 1) {
            setRentings([]);
            return;
          }
          const firstMatch = users[0];
          const { renting:r } = firstMatch;
          if (!r) {
            setRentings([]);
            return;
          }
          const _renting: Renting[] = [];
          r.forEach((r) => {
            _renting.push(
              new Renting(
                r.lending.nftAddress,
                r.lending.tokenId,
                parseLending(r.lending),
                r,
                signer
              )
            );
          });
          const normalizedLendings = renting.map((lending) => lending.toJSON());
          const normalizedLendingNew = _renting.map((lending) => lending.toJSON());

          const difference = diffJson(
            normalizedLendings,
            normalizedLendingNew,
            { ignoreWhitespace: true }
          );
          //const difference = true;
          if (difference && difference[1] && (difference[1].added || difference[1].removed)) {
            setRentings(_renting);
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
    return fetchRequest.cancel;
  }, [currAddress, renting, signer]);

  useEffect(() => {
    fetchRenting();
  }, [fetchRenting]);

  usePoller(fetchRenting, 5000);

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
