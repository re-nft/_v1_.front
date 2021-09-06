import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getUserDataOrCrateNew,
  getAllUsersVote,
} from "../../services/firebase";
import { calculateVoteByUsers } from "../../services/vote";
import { UserData, CalculatedUserVote, UsersVote } from "./types";
import { CurrentAddressWrapper } from "../CurrentAddressWrapper";
import { from, map } from "rxjs";

/**
 * Useful links
 * https://api.thegraph.com/subgraphs/name/wighawag/eip721-subgraph
 * https://api.thegraph.com/subgraphs/name/amxx/eip1155-subgraph
 * https://github.com/0xsequence/token-directory
 *
 * Kudos to
 * Luis: https://github.com/microchipgnu
 * Solidity God: wighawag
 */

type GraphContextType = {
  userData: UserData;
  usersVote: UsersVote;
  calculatedUsersVote: CalculatedUserVote;
  isLoading: boolean;
  refreshUserData: () => void;
  refreshVotes: () => void;
};

const defaultUserData = {
  favorites: {},
};

const DefaultGraphContext: GraphContextType = {
  userData: defaultUserData,
  usersVote: {},
  calculatedUsersVote: {},
  isLoading: false,
  refreshUserData: () => {
    // empty
  },
  refreshVotes: () => {
    // empty
  },
};

export const GraphContext =
  createContext<GraphContextType>(DefaultGraphContext);

export const GraphProvider: React.FC = ({ children }) => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [calculatedUsersVote, setCalculatedUsersVote] =
    useState<CalculatedUserVote>({});
  const [usersVote, setUsersVote] = useState<UsersVote>({});
  const [isLoading, setLoading] = useState(false);

  const refreshUserData = useCallback(() => {
    if (currentAddress) {
      setLoading(true);
      return from(
        getUserDataOrCrateNew(currentAddress)
          .then((userData: UserData | undefined) => {
            setLoading(false);
            if (userData) {
              setUserData(userData);
            }
          })
          .catch(() => {
            setLoading(false);

            console.warn("could not update global user data");
          })
      );
    }
    return from(Promise.resolve());
  }, [currentAddress]);

  const refreshVotes = useCallback(() => {
    return from(getAllUsersVote()).pipe(
      map((d) => {
        setUsersVote(d);
        setCalculatedUsersVote(calculateVoteByUsers(d));
      })
    );
  }, []);

  useEffect(() => {
    const s1 = refreshUserData().subscribe();
    const s2 = refreshVotes().subscribe();
    return () => {
      s1.unsubscribe();
      s2.unsubscribe();
    };
  }, [currentAddress, refreshUserData, refreshVotes]);

  return (
    <GraphContext.Provider
      value={{
        userData,
        usersVote,
        calculatedUsersVote,
        isLoading,
        refreshUserData,
        refreshVotes,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
