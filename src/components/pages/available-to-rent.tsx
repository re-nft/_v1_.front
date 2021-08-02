import React, { useCallback, useContext, useEffect, useState } from "react";
import { isLending, Lending, Nft } from "../../contexts/graph/classes";
import { NFTMetaContext } from "../../contexts/NftMetaState";
import UserContext from "../../contexts/UserProvider";
import {
  getUniqueCheckboxId,
  useBatchItems
} from "../../controller/batch-controller";
import { usePageController } from "../../controller/page-controller";
import BatchRentModal from "../../modals/batch-rent";
import BatchBar from "../batch-bar";
import { CatalogueItem } from "../catalogue-item";
import CatalogueLoader from "../catalogue-loader";
import ActionButton from "../common/action-button";
import ItemWrapper from "../common/items-wrapper";
import Pagination from "../common/pagination";
import LendingFields from "../lending-fields";
import { RentSwitchWrapper } from "../rent-switch-wrapper";

export const AvailableToRent: React.FC<{
  allAvailableToRent: Nft[];
  isLoading: boolean;
}> = ({ allAvailableToRent, isLoading }) => {
  const { signer } = useContext(UserContext);
  const {
    checkedItems,
    handleReset: handleBatchReset,
    onCheckboxChange,
    checkedLendingItems
  } = useBatchItems();
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onPageControllerInit
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
    let isSubscribed = true;
    if (isSubscribed) fetchNfts(currentPage);
    return () => {
      isSubscribed = false;
    };
  }, [currentPage, fetchNfts]);

  const checkBoxChangeWrapped = useCallback(
    (nft) => {
      return () => {
        onCheckboxChange(nft);
      };
    },
    [onCheckboxChange]
  );

  if (isLoading && currentPage.length === 0)
    return (
      <RentSwitchWrapper>
        <CatalogueLoader />
      </RentSwitchWrapper>
    );
  if (!isLoading && currentPage.length === 0)
    return (
      <RentSwitchWrapper>
        <div className="center content__message">
          You can&apos;t rent anything yet
        </div>
      </RentSwitchWrapper>
    );

  return (
    <RentSwitchWrapper>
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
    </RentSwitchWrapper>
  );
};
