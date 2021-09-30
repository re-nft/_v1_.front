import { useCallback, useMemo } from "react";
import shallow from "zustand/shallow";
import { Renting } from "../../types/classes";
import { useRentingStore } from "../store/useNftStore";
import { useTimestamp } from "./useTimestamp";

export const isClaimable = (blockTimeStamp: number, collateralClaimed: boolean, renting: Renting | null): boolean => {
  if(!renting) return false;
  if(collateralClaimed) return true;
  return renting.rentedAt * 1000 < blockTimeStamp
}

export const useIsClaimable = (
  rentingId: string | undefined,
  collateralClaimed: boolean
): boolean => {
  const blockTimeStamp = useTimestamp();
  const renting = useRentingStore(
    useCallback(
      (state) => (rentingId ? state.rentings[rentingId] : null),
      [rentingId]
    ),
    shallow
  );

  return useMemo(() => {
    return isClaimable(blockTimeStamp, collateralClaimed, renting)
  }, [collateralClaimed, renting, blockTimeStamp]);
};
