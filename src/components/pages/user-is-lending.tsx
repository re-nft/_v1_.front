import React, { useCallback, useState, useMemo } from "react";

import { Lending } from "../../types/classes";
import { CatalogueItem } from "../catalogue-item";
import { useBatchItems } from "../../hooks/misc/useBatchItems";
import { StopLendModal } from "../modals/stop-lend-modal";
import { LendSearchLayout } from "../layouts/lend-search-layout";
import { PaginationList } from "../layouts/pagination-list";
import ItemWrapper from "../common/items-wrapper";
import { useUserIsLending } from "../../hooks/queries/useUserIsLending";
import { useWallet } from "../../hooks/store/useWallet";
import { CatalogueItemRow } from "../catalogue-item/catalogue-item-row";
import { PaymentToken } from "@renft/sdk";
import { useIsClaimable } from "../../hooks/misc/useIsClaimable";
import { formatCollateral } from "../../utils";


const LendingCatalogueItem: React.FC<{
  lending: Lending;
  checkedItems: string[];
  onCheckboxChange: () => void;
  handleClickNft: (nft: Lending) => void;
  show: boolean;
}> = ({ lending, checkedItems, onCheckboxChange, handleClickNft, show }) => {
  const hasRenting = lending.hasRenting;
  const onClick = useCallback(() => {
    handleClickNft(lending);
  }, [lending, handleClickNft]);
  const checkedMoreThanOne = useMemo(() => {
    return checkedItems.length;
  }, [checkedItems]);
  const checked = useMemo(() => {
    const set = new Set(checkedItems);
    return set.has(lending.id);
  }, [checkedItems, lending]);
  const days = parseInt(String(lending.maxRentDuration), 10);
  const isClaimable = useIsClaimable(
    lending.rentingId,
    lending.collateralClaimed
  );
  const buttonTitle = useMemo(()=> {
    if (isClaimable) return checkedMoreThanOne && checked ? "Claim all" : "Claim";
    return checkedMoreThanOne && checked ? "Stop lend all" : "Stop lend";
  }, [isClaimable, checkedMoreThanOne, checked])

  return (
    <CatalogueItem
      checked={checked}
      nId={lending.nId}
      uniqueId={lending.id}
      onCheckboxChange={onCheckboxChange}
      disabled={hasRenting}
      hasAction
      show={show}
      buttonTitle={buttonTitle}
      onClick={onClick}
    >
      <CatalogueItemRow
        text={`Price/day [${PaymentToken[lending.paymentToken]}]`}
        value={lending.dailyRentPrice.toString()}
      />
      <CatalogueItemRow
        text={`Max duration [${days > 1 ? "days" : "day"}]`}
        value={days.toString()}
      />
      <CatalogueItemRow
        text={`Collateral [${PaymentToken[lending.paymentToken]}]`}
        value={formatCollateral(lending.nftPrice * Number(lending.lentAmount))}
      />
      <CatalogueItemRow
        text="Original owner"
        value={lending.hasRenting ? "renter" : "owner"}
      />
      <CatalogueItemRow
        text="Defaulted"
        value={isClaimable || lending.collateralClaimed ? "yes" : "no"}
      />
    </CatalogueItem>
  );
};

const ItemsRenderer: React.FC<{ currentPage: (Lending & {show: boolean})[] }> = ({
  currentPage
}) => {
  const {
    checkedItems,
    handleReset: batchHandleReset,
    onCheckboxChange
  } = useBatchItems();

  const [modalOpen, setModalOpen] = useState(false);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    batchHandleReset();
  }, [batchHandleReset]);

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
        onCheckboxChange(nft)
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
          checkedItems={checkedItems}
        />
      )}
      <ItemWrapper>
        {currentPage.map((lending: (Lending & {show: boolean})) => (
          <LendingCatalogueItem
            lending={lending}
            show={lending.show}
            key={lending.id}
            checkedItems={checkedItems}
            onCheckboxChange={checkBoxChangeWrapped(lending)}
            handleClickNft={handleClickNft}
          />
        ))}
      </ItemWrapper>
    </div>
  );
};

export const UserIsLending: React.FC = () => {
  const { signer } = useWallet();
  const { userLending, isLoading } = useUserIsLending();

  if (!signer) {
    return (
      <LendSearchLayout hideDevMenu>
        <div className="text-center text-lg text-white font-display py-32 leading-tight">
          Please connect your wallet!
        </div>
      </LendSearchLayout>
    );
  }

  return (
    <LendSearchLayout hideDevMenu>
      <div className="mt- px-8">
        <h2>
          <span sr-only="Lending"></span>
          <img src="/assets/Lending-Headline.svg" className="h-12" />
        </h2>
        <h3 className="text-lg">
          Here you will find he NFTs that you are lending.
        </h3>
      </div>
      <PaginationList
        nfts={userLending}
        ItemsRenderer={ItemsRenderer}
        isLoading={isLoading}
        emptyResultMessage="You are not lending anything yet"
      />
    </LendSearchLayout>
  );
};
