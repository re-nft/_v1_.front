//TODO:eniko remove this file

import React, { useCallback, useState, useMemo } from "react";

import { Lending, Renting, Nft } from "../types/classes";
import { CatalogueItem } from "../components/catalogue-item";
import BatchBar from "../components/batch-bar";
import { useBatchItems } from "../hooks/useBatchItems";
import LendingFields from "../components/lending-fields";
import { StopLendModal } from "../components/modals/stop-lend-modal";
import { LendSearchLayout } from "../components/lend-search-layout";
import { PaginationList } from "../components/pagination-list";
import { isLending, UniqueID } from "../utils";
import ItemWrapper from "../components/common/items-wrapper";
import { useUserIsLending } from "../hooks/queries/useUserIsLending";
import { useWallet } from "../hooks/useWallet";

const LendingCatalogueItem: React.FC<{
  lending: Lending;
  checkedItems: Record<UniqueID, Nft | Lending | Renting>;
  checkBoxChangeWrapped: (nft: Lending) => () => void;
  handleClickNft: (nft: Lending) => void;
}> = ({ lending, checkedItems, checkBoxChangeWrapped, handleClickNft }) => {
  const hasRenting = lending.hasRenting;
  const isChecked = !!checkedItems[lending.id];
  const onClick = useCallback(() => {
    handleClickNft(lending);
  }, [lending]);
  const checkedMoreThanOne = useMemo(()=>{
    return Object.values(checkedItems).filter(r => !!r).length > 1
  }, [checkedItems])
  return (
    <CatalogueItem
      checked={isChecked}
      nId={lending.id}
      onCheckboxChange={checkBoxChangeWrapped(lending)}
      disabled={hasRenting}
      hasAction
      buttonTitle={checkedMoreThanOne ? "Stop lending all":"Stop lending"}
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
    checkedLendingItems,
    onCheckboxChange
  } = useBatchItems();

  const [modalOpen, setModalOpen] = useState(false);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    batchHandleReset();
  }, [batchHandleReset]);

  const handleOpenModal = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

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
          nfts={checkedLendingItems}
        />
      )}
      <ItemWrapper flipId={currentPage.map((c) => c.id).join("")}>
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
      {checkedLendingItems.length > 0 && (
        <BatchBar
          title={`Selected ${checkedLendingItems.length} items`}
          actionTitle="Stop Lending"
          onClick={handleOpenModal}
          onCancel={batchHandleReset}
        />
      )}
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
