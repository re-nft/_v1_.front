import { useState, useMemo, useCallback, useContext } from "react";

import { Nft, Lending, Renting } from "../types/classes";
import { isLending, isNft, isRenting, THROWS, UniqueID } from "../utils";
import moment from "moment";
import { IRenting } from "../types";
import { TimestampContext } from "../contexts/TimestampProvider";

export type BatchContextType = {
  // needs to be a hashmap because we need to check the presence in O(1) time
  // lendingId is the one unique id. However, you can check the nfts that are
  // not yet lent, in which case the id can't be lending id. It is then
  // nftAddress::tokenId::0 <- 0 in the end is the sentinel placeholder
  // if there is a lending id, then the id becomes
  // nftAddress::tokenId:lendingId
  checkedItems: Record<UniqueID, Nft | Lending | Renting>;
  checkedNftItems: Nft[];
  checkedLendingItems: Lending[];
  checkedClaims: Lending[];
  checkedRentingItems: Renting[];
  // checkedLending and checkedRenting items are typeguarded items derived from checkedMap

  handleReset(): void;
  handleResetLending(lending?: string[]): void;
  handleResetRenting(renting?: string[]): void;
  onCheckboxChange(item: Nft | Lending | Renting): void;
};

const defaultBatchContext = {
  checkedItems: {},
  // functions
  handleReset: THROWS,
  handleResetLending: THROWS,
  handleResetRenting: THROWS,
  onCheckboxChange: THROWS,
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
  //TODO:eniko the memory usage bug
  const blockTimeStamp = useContext(TimestampContext);
  const [checkedItems, setCheckedItems] = useState<
    BatchContextType["checkedItems"]
  >(defaultBatchContext.checkedItems);

  const handleReset = useCallback(() => {
    if (Object.keys(checkedItems).length > 0)
      setCheckedItems(defaultBatchContext.checkedItems);
  }, [checkedItems]);

  const handleResetRenting = useCallback(
    (renting?: string[]) => {
      if (Object.keys(checkedItems).length > 0)
        setCheckedItems(filter(checkedItems, renting));
    },
    [checkedItems]
  );

  // remove provided items or all the lendings
  const handleResetLending = useCallback(
    (lending?: string[]) => {
      if (Object.keys(checkedItems).length > 0) {
        const items = filter(checkedItems, lending, false);
        setCheckedItems(items);
      }
    },
    [checkedItems]
  );

  const onCheckboxChange: BatchContextType["onCheckboxChange"] = useCallback(
    (item) => {
      const uniqueID = item.id;
      let newState = {};
      // if contained in prev, remove
      if (checkedItems[uniqueID]) {
        const state = { ...checkedItems };
        delete state[uniqueID];
        newState = state;
        // if not, add
      } else {
        newState = { ...checkedItems, [uniqueID]: item };
      }
      setCheckedItems(newState);
    },
    [checkedItems]
  );
  const checkedNftItems: Nft[] = useMemo(() => {
    return Object.values(checkedItems).filter(isNft);
  }, [checkedItems]);
  const checkedLendingItems: Lending[] = useMemo(() => {
    return Object.values(checkedItems).filter(isLending);
  }, [checkedItems]);

  const claimable = useCallback(isClaimable, []);

  const checkedClaims = useMemo(() => {
    return checkedLendingItems.filter(
      (l) =>
        l.renting &&
        claimable(l.renting, blockTimeStamp) &&
        !l.lending.collateralClaimed
    );
  }, [blockTimeStamp, checkedLendingItems, claimable]);

  const checkedRentingItems: Renting[] = useMemo(() => {
    return Object.values(checkedItems).filter(isRenting);
  }, [checkedItems]);

  return {
    checkedItems,
    checkedNftItems,
    checkedLendingItems,
    checkedClaims,
    handleReset,
    onCheckboxChange,
    handleResetLending,
    handleResetRenting,
    checkedRentingItems,
  };
};

export const isClaimable = (
  renting: IRenting,
  blockTimeStamp: number
): boolean => {
  const returnBy = (rentedAt: number, rentDuration: number) => {
    return moment.unix(rentedAt).add(rentDuration, "days");
  };
  const _returnBy = (renting: IRenting) =>
    returnBy(renting.rentedAt, renting.rentDuration);
  const _now = moment(blockTimeStamp);
  return _now.isAfter(_returnBy(renting));
};
