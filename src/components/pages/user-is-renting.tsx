import React, { useCallback, useState, useMemo } from "react";

import { Renting } from "../../types/classes";
import { CatalogueItem } from "../catalogue-item";
import ReturnModal from "../modals/return-modal";
import { useBatchItems } from "../../hooks/misc/useBatchItems";
import { formatCollateral, nftReturnIsExpired } from "../../utils";
import { PaymentToken } from "@renft/sdk";
import { RentSearchLayout } from "../layouts/rent-search-layout";
import { CatalogueItemRow } from "../catalogue-item/catalogue-item-row";
import { PaginationList } from "../layouts/pagination-list";
import ItemWrapper from "../common/items-wrapper";
import { useUserRenting } from "../../hooks/queries/useUserRenting";
import { useWallet } from "../../hooks/store/useWallet";
import { useTimestamp } from "../../hooks/misc/useTimestamp";

const RentingCatalogueItem: React.FC<{
  renting: Renting;
  checkedItems: Set<string>;
  onCheckboxChange: () => void;
  handleReturnNft: (renting: Renting) => () => void;
}> = ({ renting, checkedItems, onCheckboxChange, handleReturnNft }) => {
  const isExpired = nftReturnIsExpired(renting);
  const days = renting.rentDuration;
  const checkedMoreThanOne = useMemo(() => {
    return checkedItems.size > 1;
  }, [checkedItems]);
  const checked = useMemo(() => {
    return checkedItems.has(renting.id);
  }, [checkedItems, renting]);
  const blockTimeStamp = useTimestamp();
  const expired = useMemo(() => {
    return renting.rentedAt * 1000 < blockTimeStamp;
  }, [blockTimeStamp, renting.rentedAt]);

  return (
    <CatalogueItem
      nId={renting.nId}
      checked={checked}
      disabled={isExpired}
      onCheckboxChange={onCheckboxChange}
      hasAction
      buttonTitle={checkedMoreThanOne && checked ? "Return all" : "Return"}
      onClick={handleReturnNft(renting)}
    >
      <CatalogueItemRow
        text={`Price/day [${PaymentToken[renting.paymentToken]}]`}
        value={renting.dailyRentPrice.toString()}
      />
      <CatalogueItemRow
        text={`Max duration [${days > 1 ? "days" : "day"}]`}
        value={days.toString()}
      />
      <CatalogueItemRow
        text={`Collateral [${PaymentToken[renting.paymentToken]}]`}
        value={formatCollateral(renting.nftPrice * Number(renting.rentAmount))}
      />
      <CatalogueItemRow text="Defaulted" value={expired ? "yes" : "no"} />
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
        onCheckboxChange(nft)
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
            onCheckboxChange={checkBoxChangeWrapped(renting)}
            handleReturnNft={handleReturnNft}
          />
        ))}
      </ItemWrapper>
    </div>
  );
};
export const UserIsRenting: React.FC = () => {
  const { signer } = useWallet();
  const { renting, isLoading } = useUserRenting();

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
        nfts={renting}
        ItemsRenderer={ItemsRenderer}
        isLoading={isLoading}
        emptyResultMessage="You are not renting anything yet"
      />
    </RentSearchLayout>
  );
};
