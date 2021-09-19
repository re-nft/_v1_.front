//TODO:eniko remove this file

import React, { useCallback, useState, useMemo } from "react";

import { Lending } from "../types/classes";
import { CatalogueItem } from "../components/catalogue-item";
import { useBatchItems } from "../hooks/misc/useBatchItems";
import LendingFields from "../components/lending-fields";
import { StopLendModal } from "../components/modals/stop-lend-modal";
import { LendSearchLayout } from "../components/layouts/lend-search-layout";
import { PaginationList } from "../components/layouts/pagination-list";
import { isLending } from "../utils";
import ItemWrapper from "../components/common/items-wrapper";
import { useUserIsLending } from "../hooks/queries/useUserIsLending";
import { useWallet } from "../hooks/store/useWallet";

const LendingCatalogueItem: React.FC<{
  lending: Lending;
  checkedItems: Set<string>;
  checkBoxChangeWrapped: (nft: Lending) => () => void;
  handleClickNft: (nft: Lending) => void;
}> = ({ lending, checkedItems, checkBoxChangeWrapped, handleClickNft }) => {
  const hasRenting = lending.hasRenting;
  const onClick = useCallback(() => {
    handleClickNft(lending);
  }, [lending, handleClickNft]);
  const checkedMoreThanOne = useMemo(() => {
    return Object.values(checkedItems).length > 1;
  }, [checkedItems]);
  const checked = useMemo(() => {
    return checkedItems.has(lending.nId);
  }, [checkedItems, lending]);
  return (
    <CatalogueItem
      checked={checked}
      nId={lending.id}
      onCheckboxChange={checkBoxChangeWrapped(lending)}
      disabled={hasRenting}
      hasAction
      buttonTitle={checkedMoreThanOne ? "Stop lending all" : "Stop lending"}
      onClick={onClick}
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
    handleReset: batchHandleReset,
    onCheckboxChange
  } = useBatchItems();

  const [modalOpen, setModalOpen] = useState(false);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    batchHandleReset();
  }, [batchHandleReset]);

  const handleClickNft = useCallback(
    (nft: Lending) => {
      onCheckboxChange(nft);
      setModalOpen(true);
    },
    [onCheckboxChange]
  );

  const checkBoxChangeWrapped = useCallback(
    (nft) => {
      return () => {
        onCheckboxChange(nft);
      };
    },
    [onCheckboxChange]
  );

  return (
    <div>
      {modalOpen && (
        <StopLendModal
          open={modalOpen}
          onClose={handleCloseModal}
          checkedItems={checkedItems}
        />
      )}
      <ItemWrapper>
        {currentPage.map((lending: Lending) => (
          <LendingCatalogueItem
            lending={lending}
            key={lending.id}
            checkedItems={checkedItems}
            checkBoxChangeWrapped={checkBoxChangeWrapped}
            handleClickNft={handleClickNft}
          />
        ))}
      </ItemWrapper>
    </div>
  );
};
const UserCurrentlyLending: React.FC = () => {
  const { signer } = useWallet();
  const { userLending, isLoading } = useUserIsLending();

  const lendingItems = useMemo(() => {
    return userLending.filter(isLending);
  }, [userLending]);

  if (!signer) {
    return (
      <LendSearchLayout>
        <div className="text-center text-lg text-white font-display py-32 leading-tight">
          Please connect your wallet!
        </div>
      </LendSearchLayout>
    );
  }

  return (
    <LendSearchLayout>
      <PaginationList
        nfts={lendingItems}
        ItemsRenderer={ItemsRenderer}
        isLoading={isLoading}
        emptyResultMessage="You are not lending anything yet"
      />
    </LendSearchLayout>
  );
};

export default UserCurrentlyLending;
