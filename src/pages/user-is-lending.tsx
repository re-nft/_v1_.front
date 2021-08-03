import React, { useContext, useCallback, useState, useMemo } from "react";

import { Lending, isLending, Renting, Nft } from "../contexts/graph/classes";
import { CatalogueItem } from "../components/catalogue-item";
import ActionButton from "../components/common/action-button";
import BatchBar from "../components/batch-bar";
import {
  getUniqueCheckboxId,
  UniqueID,
  useBatchItems
} from "../hooks/useBatchItems";
import LendingFields from "../components/lending-fields";
import { UserLendingContext } from "../contexts/UserLending";
import UserContext from "../contexts/UserProvider";
import { StopLendModal } from "../modals/stop-lend-modal";
import { LendSwitchWrapper } from "../components/lend-switch-wrapper";
import { PaginationList } from "../components/pagination-list";

const LendingCatalogueItem: React.FC<{
  nft: Lending;
  checkedItems: Record<UniqueID, Nft | Lending | Renting>;
  checkBoxChangeWrapped: (nft: Lending) => () => void;
  handleClickNft: (nft: Lending) => void;
}> = ({ nft, checkedItems, checkBoxChangeWrapped, handleClickNft }) => {
  const hasRenting = !!nft.renting;
  const isChecked = !!checkedItems[getUniqueCheckboxId(nft)];
  return (
    <CatalogueItem
      checked={isChecked}
      nft={nft}
      onCheckboxChange={checkBoxChangeWrapped(nft)}
      disabled={hasRenting}
    >
      <LendingFields nft={nft} />
      <ActionButton<Lending>
        nft={nft}
        disabled={hasRenting || isChecked}
        title="Stop Lending"
        onClick={handleClickNft}
      />
    </CatalogueItem>
  );
};

const UserCurrentlyLending: React.FC = () => {
  const { signer } = useContext(UserContext);
  const {
    checkedItems,
    handleReset: batchHandleReset,
    checkedLendingItems,
    onCheckboxChange
  } = useBatchItems();

  const { userLending, isLoading } = useContext(UserLendingContext);
  const [modalOpen, setModalOpen] = useState(false);

  const lendingItems = useMemo(() => {
    return userLending.filter(isLending);
  }, [userLending]);

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

  const renderEmptyResult = useCallback(() => {
    return (
      <div className="center content__message">
        You are not lending anything yet
      </div>
    );
  }, []);

  if (!signer) {
    return (
      <LendSwitchWrapper>
        <div className="center content__message">
          Please connect your wallet!
        </div>
      </LendSwitchWrapper>
    );
  }

  return (
    <LendSwitchWrapper>
      {modalOpen && (
        <StopLendModal
          open={modalOpen}
          onClose={handleCloseModal}
          nfts={checkedLendingItems}
        />
      )}
      <PaginationList
        nfts={lendingItems}
        Item={LendingCatalogueItem}
        itemProps={{
          checkedItems,
          handleClickNft,
          checkBoxChangeWrapped
        }}
        isLoading={isLoading}
        renderEmptyResult={renderEmptyResult}
      />
      {checkedLendingItems.length > 0 && (
        <BatchBar
          title={`Selected ${checkedLendingItems.length} items`}
          actionTitle="Stop Lending"
          onClick={handleOpenModal}
          onCancel={batchHandleReset}
        />
      )}
    </LendSwitchWrapper>
  );
};

export default UserCurrentlyLending;
