import { useEffect, useCallback } from "react";
import {
  getUserDataOrCrateNew,
  getAllUsersVote,
} from "../../services/firebase";
import { calculateVoteByUsers } from "../../services/vote";
import { from, map } from "rxjs";
import { CalculatedUserVote, UserData, UsersVote } from "../../types";
import produce from "immer";
import create from "zustand";
import shallow from "zustand/shallow";
import { useCurrentAddress } from "../useCurrentAddress";

type UserDataState = {
  userData: UserData;
  usersVote: UsersVote;
  calculatedUsersVote: CalculatedUserVote;
  isLoading: boolean;
  setUserData: (userData: UserData) => void;
  setLoading: (b: boolean) => void;
  setCalculatedUsersVote: (v: CalculatedUserVote) => void;
  setUsersVote: (v: UsersVote) => void;
};

const useUserLendingState = create<UserDataState>((set) => ({
  userData: { favorites: {} },
  usersVote: {},
  calculatedUsersVote: {},
  isLoading: false,
  setUserData: (userData: UserData) =>
    set(
      produce((state) => {
        state.userData = userData;
      })
    ),
  setLoading: (isLoading: boolean) =>
    set(
      produce((state) => {
        state.userData = isLoading;
      })
    ),
  setCalculatedUsersVote: (s: CalculatedUserVote) =>
    set(
      produce((state) => {
        state.calculatedUsersVote = s;
      })
    ),
  setUsersVote: (s: UsersVote) =>
    set(
      produce((state) => {
        state.calculatedUsersVote = s;
      })
    ),
}));
export const useUserData = () => {
  const currentAddress = useCurrentAddress();
  const userData = useUserLendingState((state) => state.userData, shallow);
  const setUserData = useUserLendingState(
    (state) => state.setUserData,
    shallow
  );
  const isLoading = useUserLendingState((state) => state.isLoading, shallow);
  const setLoading = useUserLendingState((state) => state.setLoading, shallow);
  const usersVote = useUserLendingState((state) => state.usersVote, shallow);
  const setUsersVote = useUserLendingState(
    (state) => state.setUsersVote,
    shallow
  );
  const calculatedUsersVote = useUserLendingState(
    (state) => state.calculatedUsersVote,
    shallow
  );
  const setCalculatedUsersVote = useUserLendingState(
    (state) => state.setCalculatedUsersVote,
    shallow
  );

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
  }, [currentAddress, setLoading, setUserData]);

  const refreshVotes = useCallback(() => {
    return from(getAllUsersVote()).pipe(
      map((d) => {
        setUsersVote(d);
        setCalculatedUsersVote(calculateVoteByUsers(d));
      })
    );
  }, [setUsersVote, setCalculatedUsersVote]);

  useEffect(() => {
    const s1 = refreshUserData().subscribe();
    const s2 = refreshVotes().subscribe();
    return () => {
      s1.unsubscribe();
      s2.unsubscribe();
    };
  }, [currentAddress, refreshUserData, refreshVotes]);

  return {
    userData,
    usersVote,
    calculatedUsersVote,
    isLoading,
    refreshUserData,
    refreshVotes,
  };
};
