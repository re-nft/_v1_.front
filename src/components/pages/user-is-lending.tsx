import React, { useCallback, useState, useMemo } from "react";

import { Lending } from "../../types/classes";
import { CatalogueItem } from "../catalogue-item";
import { useBatchItems } from "../../hooks/misc/useBatchItems";
import LendingFields from "../lending-fields";
import { StopLendModal } from "../modals/stop-lend-modal";
import { LendSearchLayout } from "../layouts/lend-search-layout";
import { PaginationList } from "../layouts/pagination-list";
import ItemWrapper from "../common/items-wrapper";
import { useUserIsLending } from "../../hooks/queries/useUserIsLending";
import { useWallet } from "../../hooks/store/useWallet";

const LendingCatalogueItem: React.FC<{
  lending: Lending;
  checkedItems: Set<string>;
  checkBoxChangeWrapped: (nft: Lending) => () => void;
  handleClickNft: (nft: Lending) => void;
}> = ({ lending, checkedItems, checkBoxChangeWrapped, handleClickNft }) => {
  const hasRenting = lending.hasRenting;
  const onClick = useCallback(() => {
    handleClickNft(lending);
  }, [lending, handleClickNft]);
  const checkedMoreThanOne = useMemo(() => {
    return Object.values(checkedItems).length > 1;
  }, [checkedItems]);
  const checked = useMemo(() => {
    return checkedItems.has(lending.nId);
  }, [checkedItems, lending]);
  return (
    <CatalogueItem
      checked={checked}
      nId={lending.nId}
      onCheckboxChange={checkBoxChangeWrapped(lending)}
      disabled={hasRenting}
      hasAction
      buttonTitle={checkedMoreThanOne ? "Stop lending all" : "Stop lending"}
      onClick={onClick}
    >
      <LendingFields lending={lending} />
    </CatalogueItem>
  );
};

const ItemsRenderer: React.FC<{ currentPage: Lending[] }> = ({
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
          checkedItems={checkedItems}
        />
      )}
      <ItemWrapper>
        {currentPage.map((lending: Lending) => (
          <LendingCatalogueItem
            lending={lending}
            key={lending.id}
            checkedItems={checkedItems}
            checkBoxChangeWrapped={checkBoxChangeWrapped}
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
          <img src="/assets/Lending-headline.svg" className="h-12" />
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
