import React, { useCallback, useMemo, useState, useEffect } from "react";

import { Lending } from "renft-front/types/classes";
import { useBatchItems } from "renft-front/hooks/misc/useBatchItems";
import BatchRentModal from "renft-front/components/modals/batch-rent";
import { CatalogueItem } from "renft-front/components/catalogue-item";
import LendingFields from "renft-front/components/lending-fields";
import { PaginationList } from "renft-front/components/layouts/pagination-list";
import { RentSearchLayout } from "renft-front/components/layouts/rent-search-layout";
import ItemWrapper from "renft-front/components/common/items-wrapper";
import { useCurrentAddress } from "renft-front/hooks/misc/useCurrentAddress";

import { useSearch } from "renft-front/hooks/store/useSearch";

const RentCatalogueItem: React.FC<{
  checkedItems: string[];
  lending: Lending;
  onItemCheck: (lending: Lending) => () => void;
  handleBatchModalOpen: (lending: Lending) => () => void;
  show: boolean;
}> = ({ checkedItems, lending, onItemCheck, handleBatchModalOpen, show }) => {
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
  pageItems: Lending[];
}> = ({ currentPage, pageItems }) => {
  const { checkedItems, onCheckboxChange } = useBatchItems(
    "available-to-rent",
    pageItems
  );
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
  //TODO:eniko move this to the search-layout
  const filteredItems = useSearch(allAvailableToRent);

  return (
    <RentSearchLayout>
      <PaginationList
        nfts={filteredItems}
        ItemsRenderer={ItemsRenderer}
        isLoading={isLoading}
        emptyResultMessage="You can't rent anything yet"
      />
    </RentSearchLayout>
  );
};
