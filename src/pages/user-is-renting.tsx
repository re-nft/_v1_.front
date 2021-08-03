import React, {
  useCallback,
  useContext,
  useState,
  useMemo
} from "react";

import { isRenting, Renting } from "../contexts/graph/classes";
import { CatalogueItem } from "../components/catalogue-item";
import ReturnModal from "../modals/return-modal";
import ActionButton from "../components/common/action-button";
import BatchBar from "../components/batch-bar";
import {
  getUniqueCheckboxId,
  useBatchItems
} from "../hooks/useBatchItems";
import { Nft } from "../contexts/graph/classes";
import { UserRentingContext } from "../contexts/UserRenting";
import { nftReturnIsExpired } from "../utils";
import UserContext from "../contexts/UserProvider";
import { PaymentToken } from "@renft/sdk";
import { RentSwitchWrapper } from "../components/rent-switch-wrapper";
import { CatalogueItemRow } from "../components/catalogue-item/catalogue-item-row";
import { PaginationList } from "../components/pagination-list";

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
    (nft) => {
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
  const renderChild = useCallback(
    (nft: Renting) => {
      const id = getUniqueCheckboxId(nft);
      const checked = !!checkedItems[id];
      const isExpired = nftReturnIsExpired(nft);
      const days = nft.renting.rentDuration;
      return (
        <CatalogueItem
          key={id}
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
            onClick={() => handleReturnNft(nft)}
          />
        </CatalogueItem>
      );
    },
    [checkedItems]
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
        renderItem={renderChild}
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
