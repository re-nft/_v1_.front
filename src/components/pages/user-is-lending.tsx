import React, { useCallback, useState, useMemo, useEffect } from "react";
import shallow from "zustand/shallow";

import { useSearch } from "renft-front/hooks/store/useSearch";
import { NoSignerMessage } from "renft-front/components/no-signer-message";
import { PaymentToken } from "@renft/sdk";

import { Lending } from "renft-front/types/classes";
import { CatalogueItem } from "renft-front/components/catalogue-item";
import { useBatchItems } from "renft-front/hooks/misc/useBatchItems";
import { StopLendModal } from "renft-front/components/modals/stop-lend-modal";
import { LendSearchLayout } from "renft-front/components/layouts/lend-search-layout";
import { PaginationList } from "renft-front/components/layouts/pagination-list";
import ItemWrapper from "renft-front/components/common/items-wrapper";
import { useUserIsLending } from "renft-front/hooks/queries/useUserIsLending";
import { useWallet } from "renft-front/hooks/store/useWallet";
import { CatalogueItemRow } from "renft-front/components/catalogue-item/catalogue-item-row";
import {
  isClaimable,
  useIsClaimable,
} from "renft-front/hooks/misc/useIsClaimable";
import { formatCollateral } from "renft-front/utils";
import ClaimModal from "renft-front/components/modals/claim-modal";
import { useTimestamp } from "renft-front/hooks/misc/useTimestamp";
import {
  useLendingStore,
  useRentingStore,
} from "renft-front/hooks/store/useNftStore";

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
    return checkedItems && checkedItems.length > 1;
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
  const buttonTitle = useMemo(() => {
    if (isClaimable)
      return checkedMoreThanOne && checked ? "Claim all" : "Claim";
    return checkedMoreThanOne && checked ? "Stop lend all" : "Stop lend";
  }, [isClaimable, checkedMoreThanOne, checked]);

  const disabled = useMemo(() => {
    return (
      (hasRenting && lending.collateralClaimed) || (hasRenting && !isClaimable)
    );
  }, [isClaimable, hasRenting, lending.collateralClaimed]);
  const state = useMemo(() => {
    if (isClaimable && lending.collateralClaimed) return "claimed";
    if (isClaimable) return "claimable";
    if (lending.hasRenting) return "hasRenting";
    return "default";
  }, [lending.collateralClaimed, lending.hasRenting, isClaimable]);

  return (
    <CatalogueItem
      checked={disabled ? false : checked}
      nId={lending.nId}
      uniqueId={lending.id}
      onCheckboxChange={onCheckboxChange}
      disabled={disabled}
      hasAction
      show={show}
      buttonTitle={buttonTitle}
      onClick={onClick}
      data-testid={state}
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
        text="Has renting"
        value={lending.hasRenting ? "yes" : "no"}
      />
      <CatalogueItemRow
        text="Defaulted"
        value={isClaimable || lending.collateralClaimed ? "yes" : "no"}
      />
    </CatalogueItem>
  );
};

const ItemsRenderer: React.FC<{
  currentPage: (Lending & { show: boolean })[];
  pageItems: Lending[];
}> = ({ currentPage, pageItems }) => {
  const { checkedItems, onCheckboxChange } = useBatchItems(
    "user-is-lending",
    pageItems
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [claimModal, setClaimModalOpen] = useState(false);

  const blockTimeStamp = useTimestamp();
  const rentings = useRentingStore(
    useCallback((state) => state.rentings, []),
    shallow
  );
  const lendings = useLendingStore(
    useCallback((state) => state.lendings, []),
    shallow
  );
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const [claimableCheckedItems, nonClaimableCheckedItems] = useMemo(() => {
    const claimableItems: string[] = [];
    const nonclaimable: string[] = [];
    if (checkedItems)
      checkedItems.forEach((id) => {
        const lending = lendings[id];
        if (!lending) return;
        const claimable = isClaimable(
          blockTimeStamp,
          lending.collateralClaimed,
          lending.rentingId ? rentings[lending?.rentingId] : null
        );
        if (claimable) claimableItems.push(id);
        else nonclaimable.push(id);
      });
    return [claimableItems, nonclaimable];
  }, [checkedItems, lendings, blockTimeStamp, rentings]);

  const handleClaimCloseModal = useCallback(() => {
    setClaimModalOpen(false);
  }, []);

  const handleClickNft = useCallback(
    (lending: Lending) => () => {
      const claimable = isClaimable(
        blockTimeStamp,
        lending.collateralClaimed,
        lending.rentingId ? rentings[lending?.rentingId] : null
      );
      if (claimable) {
        setClaimModalOpen(true);
      } else {
        setModalOpen(true);
      }
    },
    [blockTimeStamp, rentings]
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
        <StopLendModal
          open={modalOpen}
          onClose={handleCloseModal}
          checkedItems={nonClaimableCheckedItems}
        />
      )}
      {claimModal && (
        <ClaimModal
          open={claimModal}
          onClose={handleClaimCloseModal}
          checkedItems={claimableCheckedItems}
        />
      )}
      <ItemWrapper>
        {currentPage.map((lending: Lending & { show: boolean }) => (
          <LendingCatalogueItem
            lending={lending}
            show={lending.show}
            key={lending.id}
            checkedItems={checkedItems}
            onCheckboxChange={onItemCheck(lending)}
            handleClickNft={handleClickNft(lending)}
          />
        ))}
      </ItemWrapper>
    </div>
  );
};

export const UserIsLending: React.FC = () => {
  const { signer } = useWallet();
  const { userLending, isLoading } = useUserIsLending();

  const filteredItems = useSearch(userLending);

  if (!signer) {
    return (
      <LendSearchLayout hideDevMenu hideSearchMenu>
        <NoSignerMessage />
      </LendSearchLayout>
    );
  }

  return (
    <LendSearchLayout hideDevMenu hideSearchMenu>
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
        nfts={filteredItems}
        ItemsRenderer={ItemsRenderer}
        isLoading={isLoading}
        emptyResultMessage="You are not lending anything yet"
      />
    </LendSearchLayout>
  );
};
