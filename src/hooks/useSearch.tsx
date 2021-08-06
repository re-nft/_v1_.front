import { useCallback, useMemo } from "react";
import { useNFTFilterBy } from "../components/app-layout/nft-filter-select";
import {
  NftSortType,
  useNFTSortBy
} from "../components/app-layout/nft-sortby-select";
import shallow from "zustand/shallow";
import { Lending, Nft } from "../contexts/graph/classes";
import { PaymentToken } from "@renft/sdk";
import { useExchangePrice } from "./useExchangePrice";
import { isLending } from "../utils";
import { useNftMetaState } from "./useMetaState";
import { NO_COLLECTION } from "../consts";
import { nftId } from "../services/firebase";

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
    return Object.keys(metas).reduce((acc, id) => {
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
  }, [keys]);

  const filterItems = useCallback(
    (
      items: (T & { priceInUSD: number; collateralInUSD: number })[],
      filter: string | null
    ) => {
      if (!filter) return items;
      const category = categories.get(filter);
      return items.filter((item) => {
        return category?.has(nftId(item.address, item.tokenId || ""));
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
      sortBy: NftSortType
    ) => {
      switch (sortBy) {
        case "all":
          return items;
        case "price-low-to-high":
          items.sort(sortByDailyRentPrice());
          return items;
        case "price-high-to-low":
          items.sort(sortByDailyRentPrice("desc"));
          return items;
        case "highest-collateral":
          items.sort(sortByCollateral());
          return items;
        case "lowest-collateral":
          items.sort(sortByCollateral("desc"));
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
        : 1
    }));
    if (filter !== "all") {
      r = filterItems(r, filter);
    }
    if (sortBy !== "all") {
      r = sortItems([...r], sortBy);
    }

    return r;
  }, [items, filter, sortBy, tokenPerUSD]);
};

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
    const arr: { name: string; description: string }[] = [];
    Object.keys(metas).forEach((id: string) => {
      const meta = metas[id];
      if (meta.collection) {
        const name = meta.collection.name || NO_COLLECTION;
        if(!set.has(name)){
          set.add(name);
          arr.push(meta.collection);
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
