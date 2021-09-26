import produce from "immer";
import { useCallback } from "react";
import create from "zustand";
import { devtools } from "zustand/middleware";
import shallow from "zustand/shallow";
import { Nft, Lending, Renting } from "../../types/classes";

export type BatchContextType = {
  // nftAddress::tokenId::lendingId
  checkedItems: string[];
  // checkedLending and checkedRenting items are typeguarded items derived from checkedMap
  handleReset(items?: string[]): void;
  onCheckboxChange(item: Nft | Lending | Renting): void;
};

export const useBatchItemsState = create<{
  values: Record<string, string[]>;
  setValues: (key: string, values: string[]) => void;
}>(
  devtools((set) => ({
    values: {},
    setValues: (key: string, values: string[]) =>
      set(
        produce((state) => {
          state.values[key] = values;
        })
      )
  }))
);
export const useBatchItems: (key: string) => BatchContextType = (key) => {
  const checkedItems = useBatchItemsState(
    useCallback((state) => state.values[key], [key]),
    shallow
  );
  const setCheckedItems = useBatchItemsState(
    useCallback((state) => state.setValues, [])
  );

  const handleReset = useCallback(
    (items: string[]) => {
      if (items) {
        const set = new Set(checkedItems);
        items.forEach((i) => {
          set.delete(i);
        });
        setCheckedItems(key, Array.from(set));
      } else if (Object.keys(checkedItems).length > 0) setCheckedItems(key, []);
    },
    [checkedItems, key, setCheckedItems]
  );

  const onCheckboxChange: BatchContextType["onCheckboxChange"] = useCallback(
    (item) => {
      const uniqueID = item.id;
      const set = new Set(checkedItems);
      // if contained in prev, remove
      if (set.has(uniqueID)) {
        set.delete(uniqueID);
        // if not, add
      } else {
        set.add(uniqueID);
      }
      setCheckedItems(key, Array.from(set));
    },
    [checkedItems, key, setCheckedItems]
  );
  return {
    checkedItems,
    handleReset,
    onCheckboxChange
  };
};
