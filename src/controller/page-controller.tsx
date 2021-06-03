import { useCallback, useState } from "react";

const defaultSate = {
  pageItems: [],
  currentPage: [],
  currentPageNumber: 1,
  totalPages: 1,
};

type State<T> = {
  pageItems: T[];
  currentPage: T[];
  currentPageNumber: number;
  totalPages: number;
};

const PAGE_SIZE = 20;

export const usePageController = <T extends unknown>(): {
  handleReset: () => void;
  onPageControllerInit: (pageItems: T[]) => void;
  onSetPage: (pageNumber: number) => void;
  currentPage: T[];
  currentPageNumber: number;
  totalPages: number;
} => {
  const [{ currentPage, currentPageNumber, totalPages, pageItems }, setState] =
    useState<State<T>>(defaultSate);
  const handleReset = useCallback(() => {
    setState(defaultSate);
  }, []);

  const getCurrentPage = useCallback(
    (pageNumber: number, totalPages: number, pageItems: T[]) => {
      const items = [...pageItems];
      if (pageNumber < 1 || pageNumber > totalPages) {
        return [];
      }
      const totalItems = pageItems.length - 1 || 0;
      const startIndex = (pageNumber - 1) * PAGE_SIZE;
      const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);

      const currentPage = items.slice(startIndex, endIndex + 1);
      return currentPage;
    },
    []
  );

  const onSetPage = useCallback(
    (pageNumber: number): void => {
      const currentPageNumber = pageNumber || 1;
      const currentPage = getCurrentPage(pageNumber, totalPages, pageItems);
      setState((prevState) => ({
        ...prevState,
        currentPageNumber,
        currentPage,
      }));
    },
    [getCurrentPage, pageItems, totalPages]
  );

  const onPageControllerInit = useCallback(
    (newItems: T[]): void => {
      if (pageItems.length === 0 && newItems.length === 0) return;
      if (pageItems.length == newItems.length) {
        const arr1 = pageItems.sort();
        const arr2 = pageItems.sort();

        if (JSON.stringify(arr1) === JSON.stringify(arr2)) {
          return;
        }
      }
      const totalItems = pageItems.length || 0;
      const totalPages = Math.ceil(totalItems / PAGE_SIZE);
      setState((prevState) => ({
        ...prevState,
        pageItems: newItems,
        totalPages,
        currentPageNumber: 1,
        currentPage: getCurrentPage(1, totalPages, newItems),
      }));
    },
    [getCurrentPage, pageItems]
  );
  return {
    handleReset,
    onPageControllerInit,
    onSetPage,
    currentPage,
    currentPageNumber,
    totalPages,
  };
};
