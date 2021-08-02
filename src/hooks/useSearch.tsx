import { useCallback, useMemo } from "react";
import {
  NftFilterType,
  useNFTFilterBy
} from "../components/app-layout/nft-filter-select";
import {
  NftSortType,
  useNFTSortBy
} from "../components/app-layout/nft-sortby-select";
import shallow from "zustand/shallow";
import { Lending } from "../contexts/graph/classes";
import { PaymentToken } from "@renft/sdk";

export const toUSD = (token: PaymentToken, amount: number) => {
  return 100;
};

export const compare = (a: number, b: number) => {
  if (a < b) {
    return -1;
  }
  if (b > a) {
    return 1;
  }
  return 0;
};

export const sortByDailyRentPrice =
  (dir = "asc") =>
  (a: Lending, b: Lending) => {
    const priceA = toUSD(a.lending.paymentToken, a.lending.dailyRentPrice);
    const priceB = toUSD(b.lending.paymentToken, b.lending.dailyRentPrice);
    const result = compare(priceA, priceB);
    return dir === "asc" ? result : result * -1;
  };

export const sortByCollateral =
  (dir = "asc") =>
  (a: Lending, b: Lending) => {
    const priceA = toUSD(a.lending.paymentToken, a.lending.nftPrice);
    const priceB = toUSD(b.lending.paymentToken, b.lending.nftPrice);
    const result = compare(priceA, priceB);
    return dir === "asc" ? result : result * -1;
  };

export const sortByDuration =
  (dir = "asc") =>
  (a: Lending, b: Lending) => {
    const priceA = a.lending.maxRentDuration;
    const priceB =b.lending.maxRentDuration;
    const result = compare(priceA, priceB);
    return dir === "asc" ? result : result * -1;
  };


export const useSearch = (items: Lending[]): Lending[] => {
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

  const filterItems = useCallback((items: Lending[], filter: NftFilterType) => {
    switch (filter) {
      case "all":
        return items;
      case "art":
        return items;
      case "utility":
        return items;
      case "gaming":
        return items;
      case "erc-721":
        return items.filter((i) => i.isERC721);
      case "erc-1155":
        return items.filter((i) => !i.isERC721);
      case "punks":
        return items.filter((i) => i.address === "");
      case "mooncats":
        return items.filter((i) => i.address === "");
      default:
        return items;
    }
  }, []);
  const sortItems = useCallback((items: Lending[], sortBy: NftSortType) => {
    switch (sortBy) {
      case "all":
        return items;
      case "price-low-to-high":
        return items.sort(sortByDailyRentPrice());
      case "price-high-to-low":
        return items.sort(sortByDailyRentPrice("desc"));
      case "highest-collateral":
        return items.sort(sortByCollateral());
      case "lowest-collateral":
        return items.sort(sortByCollateral("desc"));
      default:
        return items;
    }
  }, []);

  return useMemo(() => {
    if (filter === "all" && sortBy === "all") {
      return items;
    }
    if (filter === "all") {
      return filterItems(items, filter);
    } else if (sortBy === "all") {
      return sortItems(items, sortBy);
    }
    return sortItems(filterItems(items, filter), sortBy);
  }, [items, filter, sortBy]);
};
