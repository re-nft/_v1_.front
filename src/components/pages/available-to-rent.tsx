import React, { useCallback, useContext, useMemo, useState } from "react";
import { Lending, Nft, Renting } from "../../contexts/graph/classes";
import UserContext from "../../contexts/UserProvider";
import {
  useBatchItems
} from "../../hooks/useBatchItems";
import BatchRentModal from "../../modals/batch-rent";
import {isLending, UniqueID } from "../../utils";
import BatchBar from "../batch-bar";
import { CatalogueItem } from "../catalogue-item";
import ActionButton from "../common/action-button";
import LendingFields from "../lending-fields";
import { PaginationList } from "../pagination-list";
import { RentSwitchWrapper } from "../rent-switch-wrapper";

const RentCatalogueItem: React.FC<{
  checkedItems: Record<UniqueID, Nft | Lending | Renting>;
  nft: Lending;
  noWallet: boolean;
  checkBoxChangeWrapped: (nft: Lending) => () => void;
  handleBatchModalOpen: (nft: Lending) => () => void;
}> = ({
  checkedItems,
  nft,
  checkBoxChangeWrapped,
  noWallet,
  handleBatchModalOpen
}) => {
  const isChecked = !!checkedItems[nft.id];
  return (
    <CatalogueItem
      nft={nft}
      checked={isChecked}
      onCheckboxChange={checkBoxChangeWrapped(nft)}
    >
      <LendingFields nft={nft} />
      <ActionButton<Lending>
        onClick={handleBatchModalOpen(nft)}
        nft={nft}
        title="Rent Now"
        disabled={isChecked || noWallet}
      />
    </CatalogueItem>
  );
};

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
    (nft: Lending) => () => {
      onCheckboxChange(nft);
      setOpenBatchModel(true);
    },
    [setOpenBatchModel, onCheckboxChange]
  );

  const handleBatchRent = useCallback(() => {
    setOpenBatchModel(true);
  }, []);

  const checkBoxChangeWrapped = useCallback(
    (nft: Lending) => () => {
      onCheckboxChange(nft);
    },
    [onCheckboxChange]
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
        Item={RentCatalogueItem}
        itemProps={{
          checkedItems,
          noWallet,
          checkBoxChangeWrapped,
          handleBatchModalOpen
        }}
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
