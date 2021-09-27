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
  onItemCheck: (lending: Lending) => () => void;
  handleBatchModalOpen: (lending: Lending) => () => void;
  show: boolean;
}> = ({
  checkedItems,
  lending,
  onItemCheck,
  handleBatchModalOpen,
  show
}) => {
  const currentAddress = useCurrentAddress();
  const checkedMoreThanOne = useMemo(() => {
    return checkedItems && checkedItems.length > 1;
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
      uniqueId={lending.id}
      checked={checked}
      onCheckboxChange={onItemCheck(lending)}
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
    onCheckboxChange
  } = useBatchItems('available-to-rent');
  const [isOpenBatchModel, setOpenBatchModel] = useState(false);
  const handleBatchModalClose = useCallback(() => {
    setOpenBatchModel(false);
  }, [setOpenBatchModel]);

  const handleBatchModalOpen = useCallback(
    () => () => {
      setOpenBatchModel(true);
    },
    [setOpenBatchModel]
  );

  const onItemCheck = useCallback(
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
            onItemCheck={onItemCheck}
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
