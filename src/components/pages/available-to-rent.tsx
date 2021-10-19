import React, { useCallback, useContext, useMemo, useState } from "react";
import { Lending, Nft, Renting } from "../../contexts/graph/classes";
import UserContext from "../../contexts/UserProvider";
import { useBatchItems } from "../../hooks/useBatchItems";
import BatchRentModal from "../../modals/batch-rent";
import { isLending, UniqueID } from "../../utils";
import BatchBar from "../batch-bar";
import { CatalogueItem } from "../catalogue-item";
import ActionButton from "../common/action-button";
import LendingFields from "../lending-fields";
import { PaginationList } from "../pagination-list";
import { RentSwitchWrapper } from "../rent-switch-wrapper";
import ItemWrapper from "../common/items-wrapper";
import { CurrentAddressWrapper } from "../../contexts/CurrentAddressWrapper";

const RentCatalogueItem: React.FC<{
  checkedItems: Record<UniqueID, Nft | Lending | Renting>;
  nft: Lending;
  checkBoxChangeWrapped: (nft: Lending) => () => void;
  handleBatchModalOpen: (nft: Lending) => () => void;
}> = ({ checkedItems, nft, checkBoxChangeWrapped, handleBatchModalOpen }) => {
  const isChecked = !!checkedItems[nft.id];
  const { signer } = useContext(UserContext);
  const currentAddress = useContext(CurrentAddressWrapper);
  const userLender =
    nft.lending.lenderAddress.toLowerCase() === currentAddress.toLowerCase();
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
        title={userLender? "Your lending": "Rent Now"}
        disabled={isChecked || !signer || userLender}
      />
    </CatalogueItem>
  );
};

const ItemsRenderer: React.FC<{ currentPage: Lending[] }> = ({
  currentPage
}) => {
  const {
    checkedItems,
    handleReset: handleBatchReset,
    onCheckboxChange,
    checkedLendingItems
  } = useBatchItems();
  const [isOpenBatchModel, setOpenBatchModel] = useState(false);
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
  return (
    <div>
      <BatchRentModal
        open={isOpenBatchModel}
        handleClose={handleBatchModalClose}
        nft={checkedLendingItems}
      />

      <ItemWrapper>
        {currentPage.map((nft: Lending) => (
          <RentCatalogueItem
            key={nft.id}
            nft={nft}
            checkedItems={checkedItems}
            checkBoxChangeWrapped={checkBoxChangeWrapped}
            handleBatchModalOpen={handleBatchModalOpen}
          />
        ))}
      </ItemWrapper>
      {checkedLendingItems.length > 0 && (
        <BatchBar
          title={`Selected ${checkedLendingItems.length} items`}
          actionTitle="Rent All"
          onCancel={handleBatchReset}
          onClick={handleBatchRent}
        />
      )}
    </div>
  );
};
export const AvailableToRent: React.FC<{
  allAvailableToRent: Nft[];
  isLoading: boolean;
}> = ({ allAvailableToRent, isLoading }) => {
  const lendingItems = useMemo(() => {
    return allAvailableToRent.filter(isLending);
  }, [allAvailableToRent]);

  return (
    <RentSwitchWrapper>
      <PaginationList
        nfts={lendingItems}
        ItemsRenderer={ItemsRenderer}
        isLoading={isLoading}
        emptyResultMessage="You can't rent anything yet"
      />
    </RentSwitchWrapper>
  );
};
