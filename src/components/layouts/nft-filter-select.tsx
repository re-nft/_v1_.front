import React, { useCallback, useEffect, useMemo } from "react";

import { useRouter } from "next/router";
import produce from "immer";
import create from "zustand";
import shallow from "zustand/shallow";
import { devtools } from "renft-front/hooks/devtools";

import { CategorySelect } from "renft-front/components/common/category-select";
import {
  CategoryOptions,
  useSearchOptions,
} from "renft-front/hooks/store/useSearch";

interface NftFilterState {
  filters: string | null;
  setFilters: (value: string | null) => void;
}

export const useNFTFilterBy = create<NftFilterState>(
  devtools((set) => ({
    filters: "",
    setFilters: (value) =>
      set(
        produce((state) => {
          state.filters = value;
        })
      ),
  }))
);

export const NftFilterSelect: React.FC = () => {
  const setNftFilter = useNFTFilterBy((state) => state.setFilters);
  const filters = useNFTFilterBy(
    useCallback((state) => state.filters, []),
    shallow
  );
  const options: CategoryOptions[] = useSearchOptions();
  const value = useMemo(() => {
    return options.find((f) => f.value === filters);
  }, [filters, options]);

  const router = useRouter();
  const defaultValue = useMemo(
    () => ({ label: "All NFTs", value: "", imageUrl: "" }),
    []
  );

  useEffect(() => {
    const handleStop = () => {
      setNftFilter("");
    };
    router.events.on("routeChangeComplete", handleStop);

    return () => {
      router.events.off("routeChangeComplete", handleStop);
    };
  }, [router, setNftFilter]);

  const extendedOptions = useMemo(() => {
    return [defaultValue, ...options];
  }, [options, defaultValue]);

  if (!options || options.length === 0) return null;

  return (
    <CategorySelect
      label="Filter"
      value={value}
      options={extendedOptions}
      setValue={setNftFilter}
      defaultValue={defaultValue}
    />
  );
};
