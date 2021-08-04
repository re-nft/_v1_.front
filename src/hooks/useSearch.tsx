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
import { Lending, Nft } from "../contexts/graph/classes";
import { PaymentToken } from "@renft/sdk";
import { useExchangePrice } from "./useExchangePrice";
import { isLending } from "../utils";

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
  <T extends Nft>(
    dir: "asc" | "desc" = "asc"
  ) =>
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

  const filterItems = useCallback(
    (
      items: (T & { priceInUSD: number; collateralInUSD: number })[],
      filter: NftFilterType
    ) => {
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
          return items.filter(
            (i) =>
              i.address.toLowerCase() ===
              "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb"
          );
        case "mooncats":
          return items.filter(
            (i) =>
              i.address.toLowerCase() ===
              "0x495f947276749ce646f68ac8c248420045cb7b5e"
          );
        default:
          return items;
      }
    },
    []
  );
  const sortItems = useCallback(
    (
      items: (T & {
        priceInUSD: number;
        collateralInUSD: number;
      })[],
      sortBy: NftSortType,
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
