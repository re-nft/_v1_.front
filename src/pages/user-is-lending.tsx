import React, { useCallback, useState, useMemo } from "react";

import { Lending, Renting, Nft } from "../types/classes";
import { CatalogueItem } from "../components/catalogue-item";
import ActionButton from "../components/common/action-button";
import BatchBar from "../components/batch-bar";
import { useBatchItems } from "../hooks/useBatchItems";
import LendingFields from "../components/lending-fields";
import { StopLendModal } from "../components/modals/stop-lend-modal";
import { LendSwitchWrapper } from "../components/lend-switch-wrapper";
import { PaginationList } from "../components/pagination-list";
import { isLending, UniqueID } from "../utils";
import ItemWrapper from "../components/common/items-wrapper";
import { useSearch } from "../hooks/useSearch";
import { useUserIsLending } from "../hooks/queries/useUserIsLending";
import { useWallet } from "../hooks/useWallet";
import { useNftsStore } from "../hooks/queries/useNftStore";

const LendingCatalogueItem: React.FC<{
  lending: Lending;
  checkedItems: Record<UniqueID, Nft | Lending | Renting>;
  checkBoxChangeWrapped: (nft: Lending) => () => void;
  handleClickNft: (nft: Lending) => void;
}> = ({ lending, checkedItems, checkBoxChangeWrapped, handleClickNft }) => {
  const hasRenting = lending.hasRenting;
  const isChecked = !!checkedItems[lending.id];
  const nft = useNftsStore(
    useCallback((state) => state.nfts[lending.nId], [lending.nId])
  );
  return (
    <CatalogueItem
      checked={isChecked}
      nft={nft}
      onCheckboxChange={checkBoxChangeWrapped(lending)}
      disabled={hasRenting}
    >
      <LendingFields lending={lending} />
      <div className="py-3 flex flex-auto items-end justify-center">
        <ActionButton<Lending>
          nft={lending}
          disabled={hasRenting || isChecked}
          title="Stop Lending"
          onClick={handleClickNft}
        />
      </div>
    </CatalogueItem>
  );
};

const ItemsRenderer: React.FC<{ currentPage: Lending[] }> = ({
  currentPage,
}) => {
  const {
    checkedItems,
    handleReset: batchHandleReset,
    checkedLendingItems,
    onCheckboxChange,
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

  const items = useSearch(lendingItems);

  if (!signer) {
    return (
      <LendSwitchWrapper>
        <div className="text-center text-lg text-white font-display py-32 leading-tight">
          Please connect your wallet!
        </div>
      </LendSwitchWrapper>
    );
  }

  return (
    <LendSwitchWrapper>
      <PaginationList
        nfts={items}
        ItemsRenderer={ItemsRenderer}
        isLoading={isLoading}
        emptyResultMessage="You are not lending anything yet"
      />
    </LendSwitchWrapper>
  );
};

export default UserCurrentlyLending;
