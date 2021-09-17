//TODO:eniko remove this file

import React, { useCallback, useState, useMemo } from "react";

import { Lending, Renting, Nft } from "../types/classes";
import { CatalogueItem } from "../components/catalogue-item";
import ReturnModal from "../components/modals/return-modal";
import ActionButton from "../components/common/action-button";
import BatchBar from "../components/batch-bar";
import { useBatchItems } from "../hooks/useBatchItems";
import { isRenting, nftReturnIsExpired, UniqueID } from "../utils";
import { PaymentToken } from "@renft/sdk";
import { RentSearchLayout } from "../components/rent-search-layout";
import { CatalogueItemRow } from "../components/catalogue-item/catalogue-item-row";
import { PaginationList } from "../components/pagination-list";
import ItemWrapper from "../components/common/items-wrapper";
import { useUserRenting } from "../hooks/queries/useUserRenting";
import { useWallet } from "../hooks/useWallet";
import { useNftsStore } from "../hooks/queries/useNftStore";

const RentingCatalogueItem: React.FC<{
  renting: Renting;
  checkedItems: Record<UniqueID, Nft | Lending | Renting>;
  checkBoxChangeWrapped: (nft: Renting) => () => void;
  handleReturnNft: (renting: Renting) => () => void;
}> = ({ renting, checkedItems, checkBoxChangeWrapped, handleReturnNft }) => {
  const id = renting.id;
  const checked = !!checkedItems[id];
  const isExpired = nftReturnIsExpired(renting);
  const days = renting.rentDuration;
  const nft = useNftsStore(
    useCallback((state) => state.nfts[renting.nId], [renting.nId])
  );
  return (
    <CatalogueItem
      nft={nft}
      checked={checked}
      disabled={isExpired}
      onCheckboxChange={checkBoxChangeWrapped(renting)}
    >
      <CatalogueItemRow
        text={`Daily price [${PaymentToken[PaymentToken.DAI]}]`}
        value={renting.dailyRentPrice.toString()}
      />
      <CatalogueItemRow
        text={`Rent Duration [${days > 1 ? "days" : "day"}]`}
        value={days.toString()}
      />
      <div className="py-3 flex flex-auto items-end justify-center">
        <ActionButton<Renting>
          title="Return It"
          disabled={isExpired}
          nft={renting}
          onClick={handleReturnNft(renting)}
        />
      </div>
    </CatalogueItem>
  );
};

const ItemsRenderer: React.FC<{ currentPage: Renting[] }> = ({
  currentPage,
}) => {
  const {
    checkedItems,
    handleReset: handleBatchReset,
    onCheckboxChange,
    checkedRentingItems,
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
      <ItemWrapper flipId={currentPage.map((c) => c.id).join("")}>
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
