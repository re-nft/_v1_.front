import React, { useCallback, useMemo, useState } from "react";
import { Lending } from "../../types/classes";
import { useBatchItems } from "../../hooks/useBatchItems";
import BatchRentModal from "../modals/batch-rent";
import { isLending } from "../../utils";
import { CatalogueItem } from "../catalogue-item";
import LendingFields from "../lending-fields";
import { PaginationList } from "../pagination-list";
import { RentSearchLayout } from "../rent-search-layout";
import ItemWrapper from "../common/items-wrapper";

const RentCatalogueItem: React.FC<{
  checkedItems: Set<string>;
  lending: Lending;
  checkBoxChangeWrapped: (lending: Lending) => () => void;
  handleBatchModalOpen: (lending: Lending) => () => void;
}> = ({
  checkedItems,
  lending,
  checkBoxChangeWrapped,
  handleBatchModalOpen
}) => {
  const checkedMoreThanOne = useMemo(() => {
    return Object.values(checkedItems).length > 1;
  }, [checkedItems]);
  const checked = useMemo(() => {
    return checkedItems.has(lending.nId);
  }, [checkedItems, lending]);
  return (
    <CatalogueItem
      nId={lending.id}
      checked={checked}
      onCheckboxChange={checkBoxChangeWrapped(lending)}
      hasAction
      buttonTitle={checkedMoreThanOne ? "Rent all" : "Rent"}
      onClick={handleBatchModalOpen(lending)}
    >
      <LendingFields lending={lending} />
    </CatalogueItem>
  );
};

const ItemsRenderer: React.FC<{ currentPage: Lending[] }> = ({
  currentPage
}) => {
  const {
    checkedItems,
    handleReset: handleBatchReset,
    onCheckboxChange
  } = useBatchItems();
  const [isOpenBatchModel, setOpenBatchModel] = useState(false);
  const handleBatchModalClose = useCallback(() => {
    setOpenBatchModel(false);
    handleBatchReset();
  }, [handleBatchReset, setOpenBatchModel]);

  const handleBatchModalOpen = useCallback(
    () => () => {
      setOpenBatchModel(true);
    },
    [setOpenBatchModel]
  );

  const checkBoxChangeWrapped = useCallback(
    (nft: Lending) => () => {
      onCheckboxChange(nft);
    },
    [onCheckboxChange]
  );
  return (
    <>
      <BatchRentModal
        open={isOpenBatchModel}
        handleClose={handleBatchModalClose}
        checkedItems={checkedItems}
      />

      <ItemWrapper>
        {currentPage.map((nft: Lending) => (
          <RentCatalogueItem
            key={nft.id}
            lending={nft}
            checkedItems={checkedItems}
            checkBoxChangeWrapped={checkBoxChangeWrapped}
            handleBatchModalOpen={handleBatchModalOpen}
          />
        ))}
      </ItemWrapper>
    </>
  );
};
export const AvailableToRent: React.FC<{
  allAvailableToRent: Lending[];
  isLoading: boolean;
}> = ({ allAvailableToRent, isLoading }) => {
  const lendingItems = useMemo(() => {
    return allAvailableToRent.filter(isLending);
  }, [allAvailableToRent]);

  return (
    <RentSearchLayout>
      <PaginationList
        nfts={lendingItems}
        ItemsRenderer={ItemsRenderer}
        isLoading={isLoading}
        emptyResultMessage="You can't rent anything yet"
      />
    </RentSearchLayout>
  );
};
