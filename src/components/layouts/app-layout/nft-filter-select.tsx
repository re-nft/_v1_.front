import React, { useCallback, useEffect, useMemo } from "react";
import { CategorySelect } from "../../common/category-select";

import create from "zustand";
import shallow from "zustand/shallow";
import produce from "immer";
import { devtools } from "zustand/middleware";
import { CategoryOptions, useSearchOptions } from "../../../hooks/store/useSearch";
import { useRouter } from "next/router";

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

  useEffect(() => {
    const handleStop = () => {
      setNftFilter("");
    };
    router.events.on("routeChangeComplete", handleStop);

    return () => {
      router.events.off("routeChangeComplete", handleStop);
    };
  }, [router, setNftFilter]);

  return (
    <CategorySelect
      value={value}
      options={options}
      setValue={setNftFilter}
      defaultValue={{ label: "All NFTs", value: "", imageUrl: "" }}
    />
  );
};
