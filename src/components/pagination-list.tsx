import React, { useCallback, useEffect, useState } from "react";
import { Nft } from "../contexts/graph/classes";
import CatalogueLoader from "./catalogue-loader";
import Pagination from "./common/pagination";
import { useFetchMeta } from "../hooks/useMetaState";

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

export const PaginationList = <T extends Nft>({
  nfts,
  ItemsRenderer,
  isLoading,
  emptyResultMessage
}: {
  nfts: T[] | T[];
  isLoading: boolean;
  ItemsRenderer: React.FC<{ currentPage: T[] }>;
  emptyResultMessage: string;
}) => {
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
    if (pageItems.length === 0 || newState.pageItems.length === 0)
      setState(newState);
    else if (
      pageItems.length !== newState.pageItems.length ||
      pageItems[0].id !== newState.pageItems[0].id
    )
      setState(newState);
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

  const fetchMeta = useFetchMeta();

  // init page state
  useEffect(() => {
    let isSubscribed = true;
    if (isLoading) return;
    if (isSubscribed) onPageControllerInit(nfts);
    return () => {
      isSubscribed = false;
    };
  }, [nfts, onPageControllerInit, isLoading]);

  // Fetch meta state
  // have to fetch all elements for search
  useEffect(() => {
    if (isLoading) return;
    fetchMeta(pageItems);
  }, [pageItems, isLoading, fetchMeta]);

  if (isLoading && currentPage.length === 0) {
    return <CatalogueLoader />;
  }

  if (!isLoading && currentPage.length === 0) {
    return <div className="center content__message">{emptyResultMessage}</div>;
  }
  return (
    <>
      <ItemsRenderer currentPage={currentPage}></ItemsRenderer>
      <Pagination
        totalPages={totalPages}
        currentPageNumber={currentPageNumber}
        onSetPage={onSetPage}
      />
    </>
  );
};
