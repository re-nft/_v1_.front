import { useState, useCallback } from "react";

import { Nft, Lending, Renting } from "../../types/classes";
import { THROWS, UniqueID } from "../../utils";

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
  return {
    checkedItems,
    handleReset,
    onCheckboxChange
  };
};
