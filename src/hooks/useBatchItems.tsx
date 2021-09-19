import { useState, useCallback } from "react";

import { Nft, Lending, Renting } from "../types/classes";
import { isLending, isRenting, THROWS, UniqueID } from "../utils";
import { IRenting } from "../types";
import add from "date-fns/add";
import isAfter from "date-fns/isAfter";

export type BatchContextType = {
  // nftAddress::tokenId::lendingId
  checkedItems: Set<string>;
  // checkedLending and checkedRenting items are typeguarded items derived from checkedMap
  handleReset(items?: Set<string>): void;
  onCheckboxChange(item: Nft | Lending | Renting): void;
};

const defaultBatchContext = {
  checkedItems: new Set<string>(),
  // functions
  handleReset: THROWS,
  handleResetLending: THROWS,
  handleResetRenting: THROWS,
  onCheckboxChange: THROWS
};

const shouldDelete =
  (items: string[] | undefined, isrentcheck = true) =>
  (item: Renting | Lending | Nft) => {
    const keys = new Set(items);
    if (keys && keys.size > 0) {
      const id = item.id;
      if (id) {
        return keys.has(id);
      }
    }
    return isrentcheck ? isRenting(item) : isLending(item);
  };

const filter = (
  checkedItems: Record<UniqueID, Nft | Lending | Renting>,
  items: string[] | undefined,
  isrentcheck = true
) => {
  const fn = shouldDelete(items, isrentcheck);
  return Object.keys(checkedItems).reduce<
    Record<UniqueID, Nft | Lending | Renting>
  >((acc, key) => {
    const item = checkedItems[key];
    if (!fn(item)) acc[key] = item;
    return acc;
  }, {});
};

export const useBatchItems: () => BatchContextType = () => {
  const [checkedItems, setCheckedItems] = useState<
    BatchContextType["checkedItems"]
  >(defaultBatchContext.checkedItems);

  const handleReset = useCallback(
    (items: Set<string>) => {
      if (items) {
        const set = new Set(checkedItems);
        items.forEach((i) => {
          set.delete(i);
        });
        setCheckedItems(set);
      } else if (Object.keys(checkedItems).length > 0)
        setCheckedItems(defaultBatchContext.checkedItems);
    },
    [checkedItems]
  );

  const onCheckboxChange: BatchContextType["onCheckboxChange"] = useCallback(
    (item) => {
      const uniqueID = item.id;
      const newSet = new Set(checkedItems);
      // if contained in prev, remove
      if (newSet.has(uniqueID)) {
        newSet.delete(uniqueID);
        // if not, add
      } else {
        newSet.add(uniqueID);
      }
      setCheckedItems(newSet);
    },
    [checkedItems]
  );

  // const claimable = useCallback(isClaimable, []);

  // const checkedClaims = useMemo(() => {
  //   return checkedLendingItems.filter(
  //     (l) =>
  //       l.hasRenting &&
  //       // TODO:eniko
  //       // claimable(l.renting, blockTimeStamp) &&
  //       !l.collateralClaimed
  //   );
  // }, [blockTimeStamp, checkedLendingItems, claimable]);

  return {
    checkedItems,
    handleReset,
    onCheckboxChange
  };
};

export const isClaimable = (
  renting: IRenting,
  blockTimeStamp: number
): boolean => {
  const returnBy = (rentedAt: number, rentDuration: number) => {
    return add(new Date(rentedAt * 1000), {
      days: rentDuration
    });
  };
  const _returnBy = (renting: IRenting) =>
    returnBy(renting.rentedAt, renting.rentDuration);
  const _now = new Date(blockTimeStamp);
  return isAfter(_now, _returnBy(renting));
};
