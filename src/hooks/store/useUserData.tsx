import { useEffect, useCallback } from "react";
import { getUserDataOrCrateNew } from "renft-front/services/firebase";
import { from } from "rxjs";
import { UserData } from "renft-front/types";
import produce from "immer";
import create from "zustand";
import shallow from "zustand/shallow";
import { useCurrentAddress } from "renft-front/hooks/misc/useCurrentAddress";

type UserDataState = {
  userData: UserData;
  isLoading: boolean;
  setUserData: (userData: UserData) => void;
  setLoading: (b: boolean) => void;
};

const useUserLendingState = create<UserDataState>((set) => ({
  userData: { favorites: {} },
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
}));
export const useUserData = () => {
  const currentAddress = useCurrentAddress();
  const userData = useUserLendingState(
    useCallback((state) => state.userData, []),
    shallow
  );
  const isLoading = useUserLendingState(
    useCallback((state) => state.isLoading, []),
    shallow
  );
  const setLoading = useUserLendingState((state) => state.setLoading);
  const setUserData = useUserLendingState((state) => state.setUserData);
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
            //TODO:eniko sentry logging
            console.warn("could not update global user data");
          })
      );
    }
    return from(Promise.resolve());
  }, [currentAddress, setLoading, setUserData]);

  useEffect(() => {
    const s1 = refreshUserData().subscribe();
    return () => {
      s1.unsubscribe();
    };
  }, [currentAddress, refreshUserData]);

  return {
    userData,
    isLoading,
    refreshUserData,
  };
};
