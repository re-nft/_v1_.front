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
  checkedItems: string[];
  onCheckboxChange: () => void;
  handleReturnNft: (renting: Renting) => () => void;
  show: boolean
}> = ({ renting, checkedItems, onCheckboxChange, handleReturnNft, show }) => {
  const isExpired = nftReturnIsExpired(renting);
  const days = renting.rentDuration;
  const checkedMoreThanOne = useMemo(() => {
    return checkedItems && checkedItems.length > 1;
  }, [checkedItems]);
  const checked = useMemo(() => {
    const set = new Set(checkedItems)
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
      disabled={isExpired}
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

const ItemsRenderer: React.FC<{ currentPage: (Renting & {show: boolean})[] }> = ({
  currentPage
}) => {
  const {
    checkedItems,
    onCheckboxChange
  } = useBatchItems('user-is-renting');
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
        {currentPage.map((renting: (Renting & {show: boolean})) => (
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
