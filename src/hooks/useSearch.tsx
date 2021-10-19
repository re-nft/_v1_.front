import { useCallback, useMemo, useEffect } from "react";
import { useNFTFilterBy } from "../components/app-layout/nft-filter-select";
import { useNFTSortBy } from "../components/app-layout/nft-sortby-select";
import shallow from "zustand/shallow";
import { Lending, Nft } from "../contexts/graph/classes";
//@ts-ignore
import { PaymentToken } from "@eenagy/sdk";
import { useExchangePrice } from "./useExchangePrice";
import { isLending } from "../utils";
import { useNftMetaState } from "./useMetaState";
import { NO_COLLECTION } from "../consts";
import create from "zustand";
import produce from "immer";
import { devtools } from "zustand/middleware";
import { useRouter } from "next/router";

interface NftSearchState {
  nfts: string[];
  setSearchNfts: (nfts: Nft[]) => void;
}

export const useSearchNfts = create<NftSearchState>(
  devtools((set) => ({
    nfts: [],
    setSearchNfts: (nfts) =>
      set(
        produce((state) => {
          state.nfts = nfts.map((n) => n.nId);
        })
      )
  }))
);

export const toUSD = (
  paymentToken: PaymentToken,
  amount: number,
  tokenPerUSD: Record<PaymentToken, number>
) => {
  return amount * tokenPerUSD[paymentToken];
};

export const compare = (a: number, b: number) => {
  return a - b;
};

export const sortByDailyRentPrice =
  <T extends Nft>(dir: "asc" | "desc" = "asc") =>
  (
    a: T & { priceInUSD: number; collateralInUSD: number },
    b: T & { priceInUSD: number; collateralInUSD: number }
  ) => {
    const result = compare(a.priceInUSD, b.priceInUSD);
    return dir !== "desc" ? result : result * -1;
  };

export const sortByCollateral =
  <T extends Nft>(dir: "asc" | "desc" = "asc") =>
  (
    a: T & { priceInUSD: number; collateralInUSD: number },
    b: T & { priceInUSD: number; collateralInUSD: number }
  ) => {
    const result = compare(a.collateralInUSD, b.collateralInUSD);
    return dir !== "desc" ? result : result * -1;
  };

export const sortByLentAt =
  <T extends Lending | Renting>(dir: "asc" | "desc" = "asc") =>
  (
    a: T & { priceInUSD: number; collateralInUSD: number },
    b: T & { priceInUSD: number; collateralInUSD: number }
  ) => {
    const result = compare(a.lending?.lentAt || Date.now(), b.lending?.lentAt || Date.now());
    return dir !== "desc" ? result : result * -1;
  };

export const sortByDuration =
  (dir: "asc" | "desc" = "asc") =>
  (a: Lending, b: Lending) => {
    const priceA = a.lending.maxRentDuration;
    const priceB = b.lending.maxRentDuration;
    const result = compare(priceA, priceB);
    return dir === "desc" ? result : result * -1;
  };

export const useSearch = <T extends Nft>(items: T[]): T[] => {
  const filter = useNFTFilterBy(
    useCallback((state) => {
      return state.filters;
    }, []),
    shallow
  );

  const sortBy = useNFTSortBy(
    useCallback((state) => {
      return state.sortBy;
    }, []),
    shallow
  );
  const tokenPerUSD = useExchangePrice();
  const metas = useNftMetaState(useCallback((state) => state.metas, []));
  const keys = useNftMetaState(useCallback((state) => state.keys, []));
  const setSearchNfts = useSearchNfts((state) => state.setSearchNfts, shallow);
  const router = useRouter();

  const categories = useMemo(() => {
    const arr = keys.reduce((acc, id) => {
      const meta = metas[id];
      if (meta.collection) {
        const collectionName = metas[id].collection?.name || NO_COLLECTION;
        const set = acc.get(collectionName) || new Set();
        set.add(id);
        acc.set(collectionName, set);
      } else {
        const set = acc.get(NO_COLLECTION) || new Set();
        set.add(id);
        acc.set(NO_COLLECTION, set);
      }
      return acc;
    }, new Map<string, Set<string>>());
    return arr;
  }, [keys, metas]);

  const filterItems = useCallback(
    (
      items: (T & { priceInUSD: number; collateralInUSD: number })[],
      filter: string | null
    ) => {
      if (!filter) return items;
      const category = categories.get(filter);
      const filteredItems = items.filter((item) => {
        return category?.has(item.nId);
      });
      return filteredItems;
    },
    [categories]
  );
  const sortItems = useCallback(
    (
      items: (T & {
        priceInUSD: number;
        collateralInUSD: number;
      })[],
      sortBy: string
    ) => {
      switch (sortBy) {
        case "p-lh":
          items.sort(sortByDailyRentPrice());
          return items;
        case "p-hl":
          items.sort(sortByDailyRentPrice("desc"));
          return items;
        case "hc":
          items.sort(sortByCollateral("desc"));
          return items;
        case "lc":
          items.sort(sortByCollateral());
          return items;
        case "ori": {
          // @ts-ignore
          items.sort(sortByLentAt());
          return items;
        }
        case "lri": {
          // @ts-ignore
          items.sort(sortByLentAt("desc"));
          return items;
        }
        default:
          return items;
      }
    },
    []
  );
  useEffect(() => {
    const handleStop = () => {
      // reset items upon page navigation, resetting filter is not enough
      // when filter was not selected, it won't reset the searchitems
      setSearchNfts(items);
    };
    router.events.on("routeChangeComplete", handleStop);

    return () => {
      router.events.off("routeChangeComplete", handleStop);
    };
  }, [router, items, setSearchNfts]);

  useEffect(() => {
    setSearchNfts(items);
  }, [items, setSearchNfts]);
  return useMemo(() => {
    let r = items.map((r) => ({
      ...r,
      priceInUSD: isLending(r)
        ? toUSD(r.lending.paymentToken, r.lending.dailyRentPrice, tokenPerUSD)
        : 1,
      collateralInUSD: 0,
    }));
    r = filterItems(r, filter);
    r = sortItems([...r], sortBy);
    return r;
  }, [items, filter, sortBy, tokenPerUSD, filterItems, sortItems]);
};

export interface CategoryOptions {
  value: string;
  label: string;
  imageUrl: string;
}

export const useSearchOptions = (): CategoryOptions[] => {
  const metas = useNftMetaState(
    useCallback((state) => state.metas, []),
    shallow
  );
  const keys = useNftMetaState(
    useCallback((state) => state.keys, []),
    shallow
  );

  const activeNfts = useSearchNfts(
    useCallback((state) => state.nfts, []),
    shallow
  );

  return useMemo(() => {
    const set = new Set<string>();
    const arr: CategoryOptions[] = [];
    const searchSet = new Set(activeNfts);
    keys.forEach((id: string) => {
      if (!searchSet.has(id)) return;
      const meta = metas[id];
      if (meta.collection) {
        const name = meta.collection.name || NO_COLLECTION;
        if (!set.has(name)) {
          set.add(name);
          arr.push({
            value: meta.collection.name,
            label: meta.collection.name,
            imageUrl: meta.collection.imageUrl
          });
        }
      } else {
        if (!set.has(NO_COLLECTION)) {
          set.add(NO_COLLECTION);
        }
      }
    });
    return arr;
  }, [keys, metas, activeNfts]);
};

export const useSortOptions = (): CategoryOptions[] => {
  return useMemo(() => {
    return [
      { label: "Price: Low to High", value: "p-lh", imageUrl: "" },
      { label: "Price: High to Low", value: "p-hl", imageUrl: "" },
    ];
  }, []);
};
