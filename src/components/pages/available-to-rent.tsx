import React, { useCallback, useMemo, useState } from "react";
import { Lending } from "../../types/classes";
import { useBatchItems } from "../../hooks/misc/useBatchItems";
import BatchRentModal from "../modals/batch-rent";
import { CatalogueItem } from "../catalogue-item";
import LendingFields from "../lending-fields";
import { PaginationList } from "../layouts/pagination-list";
import { RentSearchLayout } from "../layouts/rent-search-layout";
import ItemWrapper from "../common/items-wrapper";
import { useCurrentAddress } from "../../hooks/misc/useCurrentAddress";

const RentCatalogueItem: React.FC<{
  checkedItems: string[];
  lending: Lending;
  checkBoxChangeWrapped: (lending: Lending) => () => void;
  handleBatchModalOpen: (lending: Lending) => () => void;
  show: boolean;
}> = ({
  checkedItems,
  lending,
  checkBoxChangeWrapped,
  handleBatchModalOpen,
  show
}) => {
  const currentAddress = useCurrentAddress();
  const checkedMoreThanOne = useMemo(() => {
    return checkedItems.length > 1;
  }, [checkedItems]);
  const checked = useMemo(() => {
    const set = new Set(checkedItems);
    return set.has(lending.id);
  }, [checkedItems, lending]);
  const userLender =
    lending.lenderAddress.toLowerCase() === currentAddress.toLowerCase();
  const buttonTitle = useMemo(() => {
    if (userLender) return "Lending";
    return checkedMoreThanOne && checked ? "Rent all" : "Rent";
  }, [userLender, checkedMoreThanOne, checked]);
  return (
    <CatalogueItem
      nId={lending.nId}
      checked={checked}
      onCheckboxChange={checkBoxChangeWrapped(lending)}
      hasAction
      disabled={userLender}
      show={show}
      buttonTitle={buttonTitle}
      onClick={handleBatchModalOpen(lending)}
    >
      <LendingFields lending={lending} />
    </CatalogueItem>
  );
};

const ItemsRenderer: React.FC<{
  currentPage: (Lending & { show: boolean })[];
}> = ({ currentPage }) => {
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
        {currentPage.map((lending: Lending & { show: boolean }) => (
          <RentCatalogueItem
            key={lending.id}
            show={lending.show}
            lending={lending as Lending}
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
  return (
    <RentSearchLayout>
      <PaginationList
        nfts={allAvailableToRent}
        ItemsRenderer={ItemsRenderer}
        isLoading={isLoading}
        emptyResultMessage="You can't rent anything yet"
      />
    </RentSearchLayout>
  );
};
