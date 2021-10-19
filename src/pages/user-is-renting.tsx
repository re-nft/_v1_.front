import React, { useCallback, useContext, useState, useMemo } from "react";

import { Lending, Renting } from "../contexts/graph/classes";
import { CatalogueItem } from "../components/catalogue-item";
import ReturnModal from "../modals/return-modal";
import ActionButton from "../components/common/action-button";
import BatchBar from "../components/batch-bar";
import { useBatchItems } from "../hooks/useBatchItems";
import { Nft } from "../contexts/graph/classes";
import { UserRentingContext } from "../contexts/UserRenting";
import { isRenting, nftReturnIsExpired, UniqueID } from "../utils";
import UserContext from "../contexts/UserProvider";
//@ts-ignore
import { PaymentToken } from "@eenagy/sdk";
import { RentSwitchWrapper } from "../components/rent-switch-wrapper";
import { CatalogueItemRow } from "../components/catalogue-item/catalogue-item-row";
import { PaginationList } from "../components/pagination-list";
import ItemWrapper from "../components/common/items-wrapper";
import { useSearch } from "../hooks/useSearch";

const RentingCatalogueItem: React.FC<{
  nft: Renting;
  checkedItems: Record<UniqueID, Nft | Lending | Renting>;
  checkBoxChangeWrapped: (nft: Renting) => () => void;
  handleReturnNft: (nft: Renting) => () => void;
}> = ({ nft, checkedItems, checkBoxChangeWrapped, handleReturnNft }) => {
  const id = nft.id;
  const checked = !!checkedItems[id];
  const isExpired = nftReturnIsExpired(nft.renting);
  const days = nft.renting.rentDuration;
  if (isExpired) return null;
  return (
    <CatalogueItem
      nft={nft}
      checked={checked}
      disabled={isExpired}
      onCheckboxChange={checkBoxChangeWrapped(nft)}
    >
      <CatalogueItemRow
        text={`Daily price [${PaymentToken[PaymentToken.DAI]}]`}
        value={nft.lending.dailyRentPrice.toString()}
      />
      <CatalogueItemRow
        text={`Rent Duration [${days > 1 ? "days" : "day"}]`}
        value={days.toString()}
      />
      <ActionButton<Nft>
        title="Return It"
        disabled={isExpired}
        nft={nft}
        onClick={handleReturnNft(nft)}
      />
    </CatalogueItem>
  );
};

const ItemsRenderer: React.FC<{ currentPage: Renting[] }> = ({
  currentPage
}) => {
  const {
    checkedItems,
    handleReset: handleBatchReset,
    onCheckboxChange,
    checkedRentingItems
  } = useBatchItems();
  const [modalOpen, setModalOpen] = useState(false);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    handleBatchReset();
  }, [handleBatchReset]);

  const handleBatchStopRent = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  const handleReturnNft = useCallback(
    (nft) => () => {
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
        <ReturnModal
          open={modalOpen}
          nfts={checkedRentingItems}
          onClose={handleCloseModal}
        />
      )}
      <ItemWrapper>
        {currentPage.map((nft: Renting) => (
          <RentingCatalogueItem
            nft={nft}
            key={nft.id}
            checkedItems={checkedItems}
            checkBoxChangeWrapped={checkBoxChangeWrapped}
            handleReturnNft={handleReturnNft}
          />
        ))}
      </ItemWrapper>
      {checkedRentingItems.length > 0 && (
        <BatchBar
          title={`Selected ${checkedRentingItems.length} items`}
          actionTitle={
            checkedRentingItems.length > 1 ? "Return all NFTs" : "Return NFT"
          }
          onCancel={handleBatchReset}
          onClick={handleBatchStopRent}
        />
      )}
    </div>
  );
};
const UserRentings: React.FC = () => {
  const { signer } = useContext(UserContext);
  const { userRenting, isLoading } = useContext(UserRentingContext);

  const rentingItems = useMemo(() => {
    return userRenting.filter(isRenting);
  }, [userRenting]);
  const items = useSearch(rentingItems);

  if (!signer) {
    return (
      <RentSwitchWrapper>
        <div className="center content__message">
          Please connect your wallet!
        </div>
      </RentSwitchWrapper>
    );
  }
  return (
    <RentSwitchWrapper>
      <PaginationList
        nfts={items}
        ItemsRenderer={ItemsRenderer}
        isLoading={isLoading}
        emptyResultMessage="You are not renting anything yet"
      />
    </RentSwitchWrapper>
  );
};

export default UserRentings;
