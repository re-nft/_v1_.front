import React, { useCallback, useContext, useMemo, useState } from "react";
import { isLending, Lending, Nft } from "../../contexts/graph/classes";
import UserContext from "../../contexts/UserProvider";
import {
  getUniqueCheckboxId,
  useBatchItems
} from "../../hooks/useBatchItems";
import BatchRentModal from "../../modals/batch-rent";
import BatchBar from "../batch-bar";
import { CatalogueItem } from "../catalogue-item";
import ActionButton from "../common/action-button";
import LendingFields from "../lending-fields";
import { PaginationList } from "../pagination-list";
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
  const [isOpenBatchModel, setOpenBatchModel] = useState(false);
  const noWallet = !signer;

  const lendingItems = useMemo(() => {
    return allAvailableToRent.filter(isLending);
  }, [allAvailableToRent]);

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

  const checkBoxChangeWrapped = useCallback(
    (nft) => {
      return () => {
        onCheckboxChange(nft);
      };
    },
    [onCheckboxChange]
  );

  const renderChild = useCallback(
    (nft: Lending) => {
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
    },
    [checkedItems]
  );

  const renderEmptyResult = useCallback(() => {
    return (
      <div className="center content__message">
        You can&apos;t rent anything yet
      </div>
    );
  }, []);

  return (
    <RentSwitchWrapper>
      <BatchRentModal
        open={isOpenBatchModel}
        handleClose={handleBatchModalClose}
        nft={checkedLendingItems}
      />
      <PaginationList
        nfts={lendingItems}
        renderItem={renderChild}
        isLoading={isLoading}
        renderEmptyResult={renderEmptyResult}
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
