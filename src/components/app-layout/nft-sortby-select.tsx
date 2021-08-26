import React, { useEffect, useMemo } from "react";

import create from "zustand";
import shallow from "zustand/shallow";
import produce from "immer";
import { devtools } from "zustand/middleware";
import { CategorySelect } from "../common/category-select";
import { useSortOptions } from "../../hooks/useSearch";
import { useRouter } from "next/router";

interface NftSortbyState {
  sortBy: string;
  setSortby: (value: string) => void;
}

export const useNFTSortBy = create<NftSortbyState>(
  devtools((set) => ({
    sortBy: "",
    setSortby: (value) =>
      set(
        produce((state) => {
          state.sortBy = value;
        })
      ),
  }))
);
export const NftSortBySelect: React.FC = () => {
  const setSortBy = useNFTSortBy((state) => state.setSortby, shallow);
  const sortBy = useNFTSortBy((state) => state.sortBy, shallow);
  const options = useSortOptions();
  const value = useMemo(() => {
    return options.find((f) => f.value === sortBy);
  }, [options, sortBy]);

  const router = useRouter();
  const instanceId = useMemo(() => {
    return `sort-${router.pathname}`;
  }, [router.pathname]);

  useEffect(() => {
    const handleStop = () => {
      setSortBy("");
    };
    router.events.on("routeChangeComplete", handleStop);

    return () => {
      router.events.off("routeChangeComplete", handleStop);
    };
  }, [router, setSortBy]);

  return (
    <CategorySelect
      value={value}
      setValue={setSortBy}
      options={options}
      defaultValue={{ label: "Sort by", value: "all", imageUrl: "" }}
    ></CategorySelect>
  );
};
