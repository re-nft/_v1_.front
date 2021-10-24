import React, { useCallback, useState, useMemo } from "react";

import { PaymentToken } from "@renft/sdk";

import { NoSignerMessage } from "renft-front/components/no-signer-message";
import { Renting } from "renft-front/types/classes";
import { CatalogueItem } from "renft-front/components/catalogue-item";
import ReturnModal from "renft-front/components/modals/return-modal";
import { useBatchItems } from "renft-front/hooks/misc/useBatchItems";
import { formatCollateral } from "renft-front/utils";
import { RentSearchLayout } from "renft-front/components/layouts/rent-search-layout";
import { CatalogueItemRow } from "renft-front/components/catalogue-item/catalogue-item-row";
import { PaginationList } from "renft-front/components/layouts/pagination-list";
import ItemWrapper from "renft-front/components/common/items-wrapper";
import { useUserRenting } from "renft-front/hooks/queries/useUserRenting";
import { useWallet } from "renft-front/hooks/store/useWallet";
import { useTimestamp } from "renft-front/hooks/misc/useTimestamp";

const RentingCatalogueItem: React.FC<{
  renting: Renting;
  checkedItems: string[];
  onCheckboxChange: () => void;
  handleReturnNft: (renting: Renting) => () => void;
  show: boolean;
}> = ({ renting, checkedItems, onCheckboxChange, handleReturnNft, show }) => {
  const days = renting.rentDuration;
  const checkedMoreThanOne = useMemo(() => {
    return checkedItems && checkedItems.length > 1;
  }, [checkedItems]);
  const checked = useMemo(() => {
    const set = new Set(checkedItems);
    return set.has(renting.id);
  }, [checkedItems, renting]);
  const blockTimeStamp = useTimestamp();
  const expired = useMemo(() => {
    return renting.rentedAt * 1000 < blockTimeStamp;
  }, [blockTimeStamp, renting.rentedAt]);

  return (
    <CatalogueItem
      nId={renting.nId}
      uniqueId={renting.id}
      checked={checked}
      disabled={expired}
      onCheckboxChange={onCheckboxChange}
      hasAction
      show={show}
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

const ItemsRenderer: React.FC<{
  currentPage: (Renting & { show: boolean })[];
  pageItems: Renting[];
}> = ({ currentPage, pageItems }) => {
  const { checkedItems, onCheckboxChange } = useBatchItems(
    "user-is-renting",
    pageItems
  );
  const [modalOpen, setModalOpen] = useState(false);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleReturnNft = useCallback(
    () => () => {
      setModalOpen(true);
    },
    []
  );

  const onItemCheck = useCallback(
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
        {currentPage.map((renting: Renting & { show: boolean }) => (
          <RentingCatalogueItem
            renting={renting}
            key={renting.id}
            show={renting.show}
            checkedItems={checkedItems}
            onCheckboxChange={onItemCheck(renting)}
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
        <NoSignerMessage />
      </RentSearchLayout>
    );
  }
  return (
    <RentSearchLayout hideDevMenu>
      <div className="py-4 px-8">
        <h2 className="">
          <span sr-only="Renting"></span>
          <img src="/assets/Renting-Headline.svg" className="h-12" />
        </h2>

        <h3 className="text-lg">
          Here you will find the NFTs That you are renting.
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
