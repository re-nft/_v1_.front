import React, { useCallback, useState, useContext, useEffect } from "react";

import CatalogueItem from "../../../components/catalogue-item";
import ItemWrapper from "../../../components/common/items-wrapper";
import BatchRentModal from "../../../modals/batch-rent";
import ActionButton from "../../../components/common/action-button";
import CatalogueLoader from "../../../components/catalogue-loader";
import { isLending, Lending } from "../../../contexts/graph/classes";
import BatchBar from "../../../components/batch-bar";
import {
  getUniqueCheckboxId,
  useBatchItems,
} from "../../../controller/batch-controller";
import Pagination from "../../../components/common/pagination";
import LendingFields from "../../../components/lending-fields";
import { NFTMetaContext } from "../../../contexts/NftMetaState";
import { usePageController } from "../../../controller/page-controller";
import { AvailableForRentContext } from "../../../contexts/AvailableForRent";
import UserContext from "../../../contexts/UserProvider";

// TODO: this f code is also the repeat of user-lendings and lendings
const AvailableToRent: React.FC = () => {
  const { signer } = useContext(UserContext);
  const { allAvailableToRent, isLoading } = useContext(AvailableForRentContext);
  const {
    checkedItems,
    handleReset: handleBatchReset,
    onCheckboxChange,
    checkedLendingItems,
  } = useBatchItems();
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onPageControllerInit,
  } = usePageController<Lending>();
  const [isOpenBatchModel, setOpenBatchModel] = useState(false);
  const [_, fetchNfts] = useContext(NFTMetaContext);
  const noWallet = !signer;

  useEffect(() => {
    onPageControllerInit(allAvailableToRent.filter(isLending));
  }, [allAvailableToRent, onPageControllerInit]);

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

  const checkBoxChangeWrapped = useCallback(
    (nft) => {
      return () => {
        onCheckboxChange(nft);
      };
    },
    [onCheckboxChange]
  );

  if (isLoading && currentPage.length === 0) return <CatalogueLoader />;
  if (!isLoading && currentPage.length === 0)
    return <div className="center content__message">You can&apos;t rent anything yet</div>;

  return (
    <>
      <BatchRentModal
        open={isOpenBatchModel}
        handleClose={handleBatchModalClose}
        nft={checkedLendingItems}
      />
      <ItemWrapper>
        {currentPage.map((nft: Lending) => {
          const isChecked = !!checkedItems[getUniqueCheckboxId(nft)];
          return (
            <CatalogueItem
              key={getUniqueCheckboxId(nft)}
              nft={nft}
              checked={isChecked}
              onCheckboxChange={checkBoxChangeWrapped(nft)}
              disabled={isChecked}
            >
              <LendingFields nft={nft} />
              <ActionButton<Lending>
                onClick={handleBatchModalOpen}
                nft={nft}
                title="Rent Now"
                disabled={isChecked || noWallet}
              />
            </CatalogueItem>
          );
        })}
      </ItemWrapper>
      <Pagination
        totalPages={totalPages}
        currentPageNumber={currentPageNumber}
        onSetPage={onSetPage}
      />
      {checkedLendingItems.length > 0 && (
        <BatchBar
          title={`Selected ${checkedLendingItems.length} items`}
          actionTitle="Rent All"
          onCancel={handleBatchReset}
          onClick={handleBatchRent}
        />
      )}
    </>
  );
};

export default React.memo(AvailableToRent);
