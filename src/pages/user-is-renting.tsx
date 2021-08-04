import React, { useCallback, useContext, useState, useMemo } from "react";

import { Lending, Renting } from "../contexts/graph/classes";
import { CatalogueItem } from "../components/catalogue-item";
import ReturnModal from "../modals/return-modal";
import ActionButton from "../components/common/action-button";
import BatchBar from "../components/batch-bar";
import {
  useBatchItems
} from "../hooks/useBatchItems";
import { Nft } from "../contexts/graph/classes";
import { UserRentingContext } from "../contexts/UserRenting";
import { isRenting, nftReturnIsExpired, UniqueID } from "../utils";
import UserContext from "../contexts/UserProvider";
import { PaymentToken } from "@renft/sdk";
import { RentSwitchWrapper } from "../components/rent-switch-wrapper";
import { CatalogueItemRow } from "../components/catalogue-item/catalogue-item-row";
import { PaginationList } from "../components/pagination-list";

const RentingCatalogueItem: React.FC<{
  nft: Renting;
  checkedItems: Record<UniqueID, Nft | Lending | Renting>;
  checkBoxChangeWrapped: (nft: Renting) => () => void;
  handleReturnNft: (nft: Renting) => () => void;
}> = ({ nft, checkedItems, checkBoxChangeWrapped, handleReturnNft }) => {
  const id = nft.id;
  const checked = !!checkedItems[id];
  const isExpired = nftReturnIsExpired(nft);
  const days = nft.renting.rentDuration;
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

const UserRentings: React.FC = () => {
  const { signer } = useContext(UserContext);
  const {
    checkedItems,
    handleReset: handleBatchReset,
    onCheckboxChange,
    checkedRentingItems
  } = useBatchItems();
  const { userRenting, isLoading } = useContext(UserRentingContext);
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
  const rentingItems = useMemo(() => {
    return userRenting.filter(isRenting);
  }, [userRenting]);

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
        You are not renting anything yet
      </div>
    );
  }, []);

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
      {modalOpen && (
        <ReturnModal
          open={modalOpen}
          nfts={checkedRentingItems}
          onClose={handleCloseModal}
        />
      )}
      <PaginationList
        nfts={rentingItems}
        Item={RentingCatalogueItem}
        itemProps={{
          checkedItems,
          handleReturnNft,
          checkBoxChangeWrapped
        }}
        isLoading={isLoading}
        renderEmptyResult={renderEmptyResult}
      />
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
    </RentSwitchWrapper>
  );
};

export default UserRentings;
