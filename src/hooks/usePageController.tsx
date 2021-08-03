import { useCallback, useEffect, useState } from "react";
import { Nft } from "../contexts/graph/classes";
import { hasDifference } from "../utils";

const defaultSate = {
  pageItems: [],
  currentPage: [],
  currentPageNumber: 1,
  totalPages: 1
};

type State<T> = {
  pageItems: T[];
  currentPage: T[];
  currentPageNumber: number;
  totalPages: number;
};

const PAGE_SIZE = 20;

export const usePageController = <T extends Nft>(): {
  onPageControllerInit: (pageItems: T[]) => void;
  onSetPage: (pageNumber: number) => void;
  currentPage: T[];
  currentPageNumber: number;
  totalPages: number;
} => {
  const [{ currentPage, currentPageNumber, totalPages, pageItems }, setState] =
    useState<State<T>>(defaultSate);

  const [newState, setNewState] = useState<State<T>>(defaultSate);

  const getCurrentPage = useCallback(
    (pageNumber: number, totalPages: number, pageItems: T[]) => {
      const items = [...pageItems];
      if (pageNumber < 1 || pageNumber > totalPages) {
        return [];
      }
      const totalItems = pageItems.length || 0;
      const startIndex = (pageNumber - 1) * PAGE_SIZE;
      const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);

      const currentPage = items.slice(startIndex, endIndex);
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
        currentPage
      }));
    },
    [getCurrentPage, pageItems, totalPages]
  );

  // only modify the state if there are changes
  useEffect(() => {
    if (pageItems.length === 0 && newState.pageItems.length === 0) return;
    const oldStateNormalized = pageItems;
    const newStateNormalized = newState.pageItems;
    const hasDiff = hasDifference(oldStateNormalized, newStateNormalized);
    //const difference = true;
    if (hasDiff) {
      setState((prevState) => ({
        ...prevState,
        ...newState
      }));
    }
  }, [pageItems, newState]);
  const onPageControllerInit = useCallback(
    (newItems: T[]): void => {
      const totalItems = newItems.length || 0;
      const totalPages = Math.ceil(totalItems / PAGE_SIZE);
      setNewState({
        pageItems: newItems,
        totalPages,
        currentPageNumber: 1,
        currentPage: getCurrentPage(1, totalPages, newItems)
      });
    },
    [getCurrentPage]
  );
  return {
    onPageControllerInit,
    onSetPage,
    currentPage,
    currentPageNumber,
    totalPages
  };
};
