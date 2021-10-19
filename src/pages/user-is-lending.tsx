import React, { useContext, useCallback, useState, useMemo } from "react";

import { Lending, Renting, Nft } from "../contexts/graph/classes";
import { CatalogueItem } from "../components/catalogue-item";
import ActionButton from "../components/common/action-button";
import BatchBar from "../components/batch-bar";
import { isClaimable, useBatchItems } from "../hooks/useBatchItems";
import LendingFields from "../components/lending-fields";
import { UserLendingContext } from "../contexts/UserLending";
import UserContext from "../contexts/UserProvider";
import { StopLendModal } from "../modals/stop-lend-modal";
import { LendSwitchWrapper } from "../components/lend-switch-wrapper";
import { PaginationList } from "../components/pagination-list";
import { isLending, nftReturnIsExpired, UniqueID } from "../utils";
import ItemWrapper from "../components/common/items-wrapper";
import { useSearch } from "../hooks/useSearch";
import { TimestampContext } from "../contexts/TimestampProvider";
import { Tooltip } from "@material-ui/core";

const LendingCatalogueItem: React.FC<{
  nft: Lending;
  checkedItems: Record<UniqueID, Nft | Lending | Renting>;
  checkBoxChangeWrapped: (nft: Lending) => () => void;
  handleClickNft: (nft: Lending) => void;
}> = ({ nft, checkedItems, checkBoxChangeWrapped, handleClickNft }) => {
  const isChecked = !!checkedItems[nft.id];
  const isExpired = useMemo(
    () => (nft.renting ? nftReturnIsExpired(nft.renting) : false),
    [nft.renting]
  );
  const blockTimeStamp = useContext(TimestampContext);
  const claimable = useMemo(() => {
    if (!nft.renting) return false;
    // if it is expired than it is already claimed
    if (nft.renting.expired) return false;
    return isClaimable(nft.renting, blockTimeStamp);
  }, [nft, blockTimeStamp]);
  const lendTooltip = useMemo(() => {
    const stopLendMsg = "Click to stop lending this item.";
    const rentedOutMsg =
      "The item is rented out. You have to wait until the renter returns the item.";
    if (!nft.renting) return stopLendMsg;
    if (!isExpired) return rentedOutMsg;
    if (claimable) return "Please claim first.";
    return stopLendMsg;
  }, [nft, isExpired, claimable]);
  return (
    <CatalogueItem
      checked={isChecked}
      nft={nft}
      onCheckboxChange={checkBoxChangeWrapped(nft)}
    >
      <LendingFields nft={nft} />
      <Tooltip title={lendTooltip} aria-label={lendTooltip} open>
        <span>
          <ActionButton<Lending>
            nft={nft}
            disabled={isChecked || (!isExpired && nft.renting) || claimable}
            title="Stop Lending"
            onClick={handleClickNft}
          />
        </span>
      </Tooltip>
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
      <ItemWrapper>
        {currentPage.map((nft: Lending) => (
          <LendingCatalogueItem
            nft={nft}
            key={nft.id}
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
  const { signer } = useContext(UserContext);
  const { userLending, isLoading } = useContext(UserLendingContext);

  const lendingItems = useMemo(() => {
    return userLending.filter(isLending);
  }, [userLending]);

  const items = useSearch(lendingItems);

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
