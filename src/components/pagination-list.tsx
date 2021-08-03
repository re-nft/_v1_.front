import React, { useContext, useEffect } from "react";
import { Nft } from "../contexts/graph/classes";
import ItemWrapper from "../components/common/items-wrapper";
import CatalogueLoader from "../components/catalogue-loader";
import Pagination from "../components/common/pagination";
import { usePageController } from "../hooks/usePageController";
import { NFTMetaContext } from "../contexts/NftMetaState";

export const PaginationList = <T extends Nft>({
  nfts,
  renderItem,
  isLoading,
  renderEmptyResult
}: {
  nfts: T[] | T[];
  isLoading: boolean;
  renderItem: (item: T) => JSX.Element;
  renderEmptyResult: () => JSX.Element;
}) => {
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onPageControllerInit
  } = usePageController<T>();
  const [_, fetchNfts] = useContext(NFTMetaContext);

  useEffect(() => {
    let isSubscribed = true;
    if (isSubscribed) onPageControllerInit(nfts);
    return () => {
      isSubscribed = false;
    };
  }, [nfts, onPageControllerInit]);

  // Prefetch metadata
  // TODO move
  useEffect(() => {
    let isSubscribed = true;
    if (isSubscribed) fetchNfts(currentPage);
    return () => {
      isSubscribed = false;
    };
  }, [currentPage, fetchNfts]);

  if (isLoading && currentPage.length === 0) {
    return <CatalogueLoader />;
  }

  if (!isLoading && currentPage.length === 0) {
    return renderEmptyResult();
  }
  return (
    <>
      <ItemWrapper>{currentPage.map(renderItem)}</ItemWrapper>
      <Pagination
        totalPages={totalPages}
        currentPageNumber={currentPageNumber}
        onSetPage={onSetPage}
      />
    </>
  );
};
