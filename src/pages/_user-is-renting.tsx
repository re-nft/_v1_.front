//TODO:eniko remove this file

import React, { useCallback, useState, useMemo } from "react";

import { Renting } from "../types/classes";
import { CatalogueItem } from "../components/catalogue-item";
import ReturnModal from "../components/modals/return-modal";
import { useBatchItems } from "../hooks/misc/useBatchItems";
import { isRenting, nftReturnIsExpired } from "../utils";
import { PaymentToken } from "@renft/sdk";
import { RentSearchLayout } from "../components/layouts/rent-search-layout";
import { CatalogueItemRow } from "../components/catalogue-item/catalogue-item-row";
import { PaginationList } from "../components/layouts/pagination-list";
import ItemWrapper from "../components/common/items-wrapper";
import { useUserRenting } from "../hooks/queries/useUserRenting";
import { useWallet } from "../hooks/store/useWallet";

const RentingCatalogueItem: React.FC<{
  renting: Renting;
  checkedItems: Set<string>;
  checkBoxChangeWrapped: (nft: Renting) => () => void;
  handleReturnNft: (renting: Renting) => () => void;
}> = ({ renting, checkedItems, checkBoxChangeWrapped, handleReturnNft }) => {
  const id = renting.id;
  const isExpired = nftReturnIsExpired(renting);
  const days = renting.rentDuration;
  const checkedMoreThanOne = useMemo(() => {
    return Object.values(checkedItems).length > 1;
  }, [checkedItems]);
  const checked = useMemo(() => {
    return checkedItems.has(renting.nId);
  }, [checkedItems, renting]);
  return (
    <CatalogueItem
      nId={renting.nId}
      checked={checked}
      disabled={isExpired}
      onCheckboxChange={checkBoxChangeWrapped(renting)}
      hasAction
      buttonTitle={checkedMoreThanOne ? "Return all" : "Return it"}
      onClick={handleReturnNft(renting)}
    >
      <CatalogueItemRow
        text={`Daily price [${PaymentToken[PaymentToken.DAI]}]`}
        value={renting.dailyRentPrice.toString()}
      />
      <CatalogueItemRow
        text={`Rent Duration [${days > 1 ? "days" : "day"}]`}
        value={days.toString()}
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
    onCheckboxChange
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
          checkedItems={checkedItems}
          onClose={handleCloseModal}
        />
      )}
      <ItemWrapper>
        {currentPage.map((renting: Renting) => (
          <RentingCatalogueItem
            renting={renting}
            key={renting.id}
            checkedItems={checkedItems}
            checkBoxChangeWrapped={checkBoxChangeWrapped}
            handleReturnNft={handleReturnNft}
          />
        ))}
      </ItemWrapper>
    </div>
  );
};
const UserRentings: React.FC = () => {
  const { signer } = useWallet();
  const { renting: userRenting, isLoading } = useUserRenting();

  const rentingItems = useMemo(() => {
    return userRenting.filter(isRenting);
  }, [userRenting]);

  if (!signer) {
    return (
      <RentSearchLayout>
        <div className="text-center text-base text-white font-display py-32 leading-tight">
          Please connect your wallet!
        </div>
      </RentSearchLayout>
    );
  }
  return (
    <RentSearchLayout>
      <PaginationList
        nfts={rentingItems}
        ItemsRenderer={ItemsRenderer}
        isLoading={isLoading}
        emptyResultMessage="You are not renting anything yet"
      />
    </RentSearchLayout>
  );
};

export default UserRentings;
