import React, { useCallback, useState, useContext, useEffect, useMemo } from "react";

import CatalogueItem from "../../../components/catalogue-item";
import ItemWrapper from "../../../components/items-wrapper";
import BatchRentModal from "../../../modals/batch-rent";
import ActionButton from "../../../components/action-button";
import CatalogueLoader from "../../../components/catalogue-loader";
import { Lending, Nft, isLending } from "../../../contexts/graph/classes";
import BatchBar from "../../../components/batch-bar";
import {
  BatchContext,
  getUniqueID,
  useCheckedLendingItems,
  useCheckedRentingItems,
} from "../../../controller/batch-controller";
import Pagination from "../../../components/pagination";
import { PageContext } from "../../../controller/page-controller";
import LendingFields from "../../../components/lending-fields";
import { NFTMetaContext } from "../../../contexts/NftMetaState";
import { useAllAvailableToRent } from "../../../contexts/graph/hooks/useAllAvilableToRent";


// TODO: this f code is also the repeat of user-lendings and lendings
const AvailableToRent: React.FC = () => {
  const {
    checkedItems,
    handleReset: handleBatchReset,
    onCheckboxChange,
  } = useContext(BatchContext);
  const checkedLendingItems = useCheckedLendingItems();
  const checkedRentingItems = useCheckedRentingItems();
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onChangePage,
  } = useContext(PageContext);
  const [isOpenBatchModel, setOpenBatchModel] = useState(false);
  const { allAvailableToRent, isLoading } = useAllAvailableToRent();
  const [_, fetchNfts] = useContext(NFTMetaContext);

  useEffect(() => {
    onChangePage(allAvailableToRent);
  }, [allAvailableToRent, onChangePage]);

  const handleBatchModalClose = useCallback(() => {
    setOpenBatchModel(false);
    handleBatchReset();
  }, [handleBatchReset, setOpenBatchModel]);

  const handleBatchModalOpen = useCallback(
    (nft: Lending) => {
      onCheckboxChange(nft);
      setOpenBatchModel(true);
    },
    [setOpenBatchModel, onCheckboxChange]
  );

  const handleBatchRent = useCallback(() => {
    setOpenBatchModel(true);
  }, []);

  //Prefetch metadata
  useEffect(() => {
    fetchNfts(currentPage);
  }, [currentPage, fetchNfts]);

  if (isLoading && currentPage.length === 0) return <CatalogueLoader />;
  if (!isLoading && currentPage.length === 0)
    return <div className="center">You cant rent anything yet</div>;

  return (
    <>
      <BatchRentModal
        nft={checkedLendingItems}
        open={isOpenBatchModel}
        handleClose={handleBatchModalClose}
      />
      <ItemWrapper>
        {currentPage.map((nft: Lending | Nft) => {
          if (isLending(nft)) {
            return (
              <CatalogueItem
                key={getUniqueID(nft.address, nft.tokenId, nft.lending.id)}
                nft={nft}
                checked={
                  !!checkedItems[
                    getUniqueID(nft.address, nft.tokenId, nft.lending.id)
                  ]
                }
              >
                <LendingFields nft={nft} />
                <ActionButton<Lending>
                  onClick={handleBatchModalOpen}
                  nft={nft}
                  title="Rent Now"
                />
              </CatalogueItem>
            );
          }
        })}
      </ItemWrapper>
      <Pagination
        totalPages={totalPages}
        currentPageNumber={currentPageNumber}
        onSetPage={onSetPage}
      />
      {checkedLendingItems.length > 1 && (
        <BatchBar
          title={`Selected ${checkedLendingItems.length} items`}
          actionTitle="Rent All"
          onCancel={handleBatchReset}
          onClick={handleBatchRent}
        />
      )}
      {checkedRentingItems.length > 1 && (
        <BatchBar
          title={`Selected ${checkedRentingItems.length} items`}
          actionTitle="Rent All"
          onCancel={handleBatchReset}
          onClick={handleBatchRent}
        />
      )}
    </>
  );
};

export default React.memo(AvailableToRent);
