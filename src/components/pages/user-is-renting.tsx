import React, { useCallback, useState, useMemo } from "react";

import { Renting } from "../../types/classes";
import { CatalogueItem } from "../catalogue-item";
import ReturnModal from "../modals/return-modal";
import { useBatchItems } from "../../hooks/misc/useBatchItems";
import { isRenting, nftReturnIsExpired } from "../../utils";
import { PaymentToken } from "@renft/sdk";
import { RentSearchLayout } from "../layouts/rent-search-layout";
import { CatalogueItemRow } from "../catalogue-item/catalogue-item-row";
import { PaginationList } from "../layouts/pagination-list";
import ItemWrapper from "../common/items-wrapper";
import { useUserRenting } from "../../hooks/queries/useUserRenting";
import { useWallet } from "../../hooks/store/useWallet";

const RentingCatalogueItem: React.FC<{
  renting: Renting;
  checkedItems: Set<string>;
  checkBoxChangeWrapped: (nft: Renting) => () => void;
  handleReturnNft: (renting: Renting) => () => void;
}> = ({ renting, checkedItems, checkBoxChangeWrapped, handleReturnNft }) => {
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
export const UserIsRenting: React.FC = () => {
  const { signer } = useWallet();
  const { renting: userRenting, isLoading } = useUserRenting();

  const rentingItems = useMemo(() => {
    return userRenting.filter(isRenting);
  }, [userRenting]);

  if (!signer) {
    return (
      <RentSearchLayout hideDevMenu>
        <div className="text-center text-base text-white font-display py-32 leading-tight">
          Please connect your wallet!
        </div>
      </RentSearchLayout>
    );
  }
  return (
    <RentSearchLayout hideDevMenu>
      <div className="py-4 px-8">
        <h2 className="">
          <span sr-only="Renting"></span>
          <img src="/assets/Renting-headline.svg" className="h-12" />
        </h2>

        <h3 className="text-lg">
          Here you will find The NFTs That you are renting.
        </h3>
      </div>
      <PaginationList
        nfts={rentingItems}
        ItemsRenderer={ItemsRenderer}
        isLoading={isLoading}
        emptyResultMessage="You are not renting anything yet"
      />
    </RentSearchLayout>
  );
};
