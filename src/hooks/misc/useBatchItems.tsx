import { useState, useCallback } from "react";

import { Nft, Lending, Renting } from "../../types/classes";
import { THROWS, UniqueID } from "../../utils";

export type BatchContextType = {
  // nftAddress::tokenId::lendingId
  checkedItems: string[];
  // checkedLending and checkedRenting items are typeguarded items derived from checkedMap
  handleReset(items?: string[]): void;
  onCheckboxChange(item: Nft | Lending | Renting): void;
};

const defaultBatchContext = {
  checkedItems: new Map<string, boolean>(),
  // functions
  handleReset: THROWS,
  handleResetLending: THROWS,
  handleResetRenting: THROWS,
  onCheckboxChange: THROWS
};

export const useBatchItems: () => BatchContextType = () => {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const handleReset = useCallback(
    (items: string[]) => {
      if (items) {
        const set = new Set(checkedItems);
        items.forEach((i) => {
          set.delete(i);
        });
        setCheckedItems(Array.from(set));
      } else if (Object.keys(checkedItems).length > 0)
        setCheckedItems([]);
    },
    [checkedItems]
  );

  const onCheckboxChange: BatchContextType["onCheckboxChange"] = useCallback(
    (item) => {
      const uniqueID = item.id;
      const set = new Set(checkedItems)
      // if contained in prev, remove
      if (set.has(uniqueID)) {
        set.delete(uniqueID);
        // if not, add
      } else {
        set.add(uniqueID);
      }
      setCheckedItems(Array.from(set));
    },
    [checkedItems]
  );
  return {
    checkedItems,
    handleReset,
    onCheckboxChange
  };
};
