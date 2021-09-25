import add from "date-fns/add";
import isAfter from "date-fns/isAfter";
import { useCallback, useMemo } from "react";
import shallow from "zustand/shallow";
import { Renting } from "../../types/classes";
import { useRentingStore } from "../store/useNftStore";
import { useTimestamp } from "./useTimestamp";

const isClaimable = (renting: Renting, blockTimeStamp: number): boolean => {
  const returnBy = (rentedAt: number, rentDuration: number) => {
    return add(new Date(rentedAt * 1000), {
      days: rentDuration
    });
  };
  const _returnBy = (renting: Renting) =>
    returnBy(renting.rentedAt, renting.rentDuration);
  const _now = new Date(blockTimeStamp);
  return isAfter(_now, _returnBy(renting));
};

export const useIsClaimable = (
  rentingId: string | undefined,
  collateralClaimed: boolean
): boolean => {
  const blockTimeStamp = useTimestamp();
  const renting = useRentingStore(
    useCallback(
      (state) =>
        rentingId
          ? state.rentings.find((r: Renting) => r.id === rentingId)
          : null,
      [rentingId]
    ),
    shallow
  );

  return useMemo(
    () =>
      !!(renting
        ? isClaimable(renting, blockTimeStamp) && !collateralClaimed
        : false),
    [collateralClaimed, renting, blockTimeStamp]
  );
};
