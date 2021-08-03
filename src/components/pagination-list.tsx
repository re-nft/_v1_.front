import React, { useCallback, useEffect, useState } from "react";
import { Nft } from "../contexts/graph/classes";
import ItemWrapper from "../components/common/items-wrapper";
import CatalogueLoader from "../components/catalogue-loader";
import Pagination from "../components/common/pagination";
import { useFetchMeta } from "../hooks/useMetaState";
import { hasDifference } from "../utils";
import { getUniqueCheckboxId } from "../hooks/useBatchItems";
import { useDebounce } from "../hooks/useDebounce";
import { SECOND_IN_MILLISECONDS } from "../consts";

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

export const PaginationList = <
  T extends Nft,
  V extends Record<string, unknown>
>({
  nfts,
  Item,
  isLoading,
  renderEmptyResult,
  itemProps
}: {
  nfts: T[] | T[];
  isLoading: boolean;
  Item: React.FC<{ nft: T } & V>;
  renderEmptyResult: () => JSX.Element;
  itemProps: V;
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

  const fetchMeta = useFetchMeta();

  // init page state
  useEffect(() => {
    let isSubscribed = true;
    if(isLoading) return;
    if (isSubscribed) onPageControllerInit(nfts);
    return () => {
      isSubscribed = false;
    };
  }, [nfts, onPageControllerInit, isLoading]);

  // Fetch meta state
  useEffect(() => {
    if(isLoading) return;
    fetchMeta(currentPage);
  }, [currentPage, isLoading]);

  if (isLoading && currentPage.length === 0) {
    return <CatalogueLoader />;
  }

  if (!isLoading && currentPage.length === 0) {
    return renderEmptyResult();
  }
  return (
    <>
      <ItemWrapper>
        {currentPage.map((nft) => (
          <Item nft={nft} {...itemProps} key={getUniqueCheckboxId(nft)} />
        ))}
      </ItemWrapper>
      <Pagination
        totalPages={totalPages}
        currentPageNumber={currentPageNumber}
        onSetPage={onSetPage}
      />
    </>
  );
};
