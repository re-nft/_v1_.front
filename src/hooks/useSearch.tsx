import { useCallback, useMemo } from "react";
import { useNFTFilterBy } from "../components/app-layout/nft-filter-select";
import { useNFTSortBy } from "../components/app-layout/nft-sortby-select";
import shallow from "zustand/shallow";
import { Lending, Nft } from "../contexts/graph/classes";
import { PaymentToken } from "@renft/sdk";
import { useExchangePrice } from "./useExchangePrice";
import { isLending } from "../utils";
import { useNftMetaState } from "./useMetaState";
import { NO_COLLECTION } from "../consts";

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
    return dir === "desc" ? result : result * -1;
  };

export const sortByCollateral =
  <T extends Nft>(dir: "asc" | "desc" = "asc") =>
  (
    a: T & { priceInUSD: number; collateralInUSD: number },
    b: T & { priceInUSD: number; collateralInUSD: number }
  ) => {
    const result = compare(a.collateralInUSD, b.collateralInUSD);
    return dir === "desc" ? result : result * -1;
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

  const categories = useMemo(() => {
    return keys.reduce((acc, id) => {
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
  }, [keys, metas]);

  const filterItems = useCallback(
    (
      items: (T & { priceInUSD: number; collateralInUSD: number })[],
      filter: string | null
    ) => {
      if (!filter) return items;
      const category = categories.get(filter);
      return items.filter((item) => {
        return category?.has(item.nId);
      });
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
        default:
          return items;
      }
    },
    []
  );

  return useMemo(() => {
    let r = items.map((r) => ({
      ...r,
      priceInUSD: isLending(r)
        ? toUSD(r.lending.paymentToken, r.lending.dailyRentPrice, tokenPerUSD)
        : 1,
      collateralInUSD: isLending(r)
        ? toUSD(r.lending.paymentToken, r.lending.nftPrice, tokenPerUSD)
        : 1,
    }));
    r = filterItems(r, filter);
    r = sortItems([...r], sortBy);
    return r;
  }, [items, filter, sortBy, tokenPerUSD]);
};

export interface CategoryOptions {
  value: string;
  label: string;
  imageUrl: string;
}

export const useSearchOptions = () => {
  const metas = useNftMetaState(
    useCallback((state) => state.metas, []),
    shallow
  );
  const keys = useNftMetaState(
    useCallback((state) => state.keys, []),
    shallow
  );
  return useMemo(() => {
    const set = new Set<string>();
    const arr: CategoryOptions[] = [];
    Object.keys(metas).forEach((id: string) => {
      const meta = metas[id];
      if (meta.collection) {
        const name = meta.collection.name || NO_COLLECTION;
        if (!set.has(name)) {
          set.add(name);
          arr.push({
            value: meta.collection.name,
            label: meta.collection.name,
            imageUrl: meta.collection.imageUrl,
          });
        }
      } else {
        if (!set.has(NO_COLLECTION)) {
          set.add(NO_COLLECTION);
        }
      }
    });
    return arr;
  }, [keys]);
};

export const useSortOptions = () => {
  return useMemo(() => {
    return [
      { label: "Price: Low to High", value: "p-lh", imageUrl: "" },
      { label: "Price: High to Low", value: "p-hl", imageUrl: "" },
      { label: "Highest Collateral", value: "hc", imageUrl: "" },
      { label: "Lowest Colletaral", value: "lc", imageUrl: "" },
    ];
  }, []);
};
