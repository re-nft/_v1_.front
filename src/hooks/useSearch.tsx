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
import { useExchangePrice } from "./useExchangePrice";

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
  (tokenPerUSD: Record<PaymentToken, number>, dir : 'asc' | 'desc' = "asc") =>
  (a: Lending, b: Lending) => {
    const priceA = toUSD(
      a.lending.paymentToken,
      a.lending.dailyRentPrice,
      tokenPerUSD
    );
    const priceB = toUSD(
      b.lending.paymentToken,
      b.lending.dailyRentPrice,
      tokenPerUSD
    );
    const result = compare(priceA, priceB);
    return dir === "desc" ? result : result * -1;
  };

export const sortByCollateral =
  (tokenPerUSD: Record<PaymentToken, number>, dir: 'asc' | 'desc' = "asc") =>
  (a: Lending, b: Lending) => {
    const priceA = toUSD(
      a.lending.paymentToken,
      a.lending.nftPrice,
      tokenPerUSD
    );
    const priceB = toUSD(
      b.lending.paymentToken,
      b.lending.nftPrice,
      tokenPerUSD
    );
    const result = compare(priceA, priceB);
    return dir === "desc" ? result : result * -1;
  };

export const sortByDuration =
  (dir: 'asc' | 'desc' = "asc") =>
  (a: Lending, b: Lending) => {
    const priceA = a.lending.maxRentDuration;
    const priceB = b.lending.maxRentDuration;
    const result = compare(priceA, priceB);
    return dir === "desc" ? result : result * -1;
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
  const tokenPerUSD = useExchangePrice();

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
  }, []);
  const sortItems = useCallback(
    (items: Lending[], sortBy: NftSortType, tokenPerUSD) => {
      switch (sortBy) {
        case "all":
          return items;
        case "price-low-to-high":
          items.sort(sortByDailyRentPrice(tokenPerUSD));
          return items;
        case "price-high-to-low":
          items.sort(sortByDailyRentPrice(tokenPerUSD, "desc"));
          return items;
        case "highest-collateral":
          items.sort(sortByCollateral(tokenPerUSD));
          return items;
        case "lowest-collateral":
          items.sort(sortByCollateral(tokenPerUSD, "desc"));
          return items;
        default:
          return items;
      }
    },
    []
  );

  return useMemo(() => {
    let r = items;
    r = r.map((r) => ({
      ...r,
      priceInUSD: toUSD(
        r.lending.paymentToken,
        r.lending.dailyRentPrice,
        tokenPerUSD
      ),
      collateralInUSD: toUSD(
        r.lending.paymentToken,
        r.lending.dailyRentPrice,
        tokenPerUSD
      )
    }));
    if (filter !== "all") {
      r = filterItems(r, filter);
    }
    if (sortBy !== "all") {
      r = sortItems([...r], sortBy, tokenPerUSD);
    }

    return r;
  }, [items, filter, sortBy, tokenPerUSD]);
};
