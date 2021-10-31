import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Nft } from "renft-front/types/classes";
import BatchLendModal from "renft-front/components/modals/batch-lend";
import { CatalogueItem } from "renft-front/components/catalogue-item";
import { useBatchItems } from "renft-front/hooks/misc/useBatchItems";
import { useAllAvailableToLend } from "renft-front/hooks/queries/useAllAvailableToLend";
import { LendSearchLayout } from "renft-front/components/layouts/lend-search-layout";
import { PaginationList } from "renft-front/components/layouts/pagination-list";
import ItemWrapper from "renft-front/components/common/items-wrapper";
import { useWallet } from "renft-front/hooks/store/useWallet";
import { NoSignerMessage } from "renft-front/components/no-signer-message";
import { useSearch } from "renft-front/hooks/store/useSearch";

const LendCatalagoueItem: React.FC<{
  checkedItems: string[];
  nft: Nft;
  onItemCheck: () => void;
  handleStartLend: () => void;
  show: boolean;
}> = ({ checkedItems, nft, onItemCheck, handleStartLend, show }) => {
  //TODO:eniko optimize this
  const checked = useMemo(() => {
    const set = new Set(checkedItems);
    return set.has(nft.nId);
  }, [checkedItems, nft.nId]);
  const checkedMoreThanOne = useMemo(() => {
    return checkedItems && checkedItems.length > 1;
  }, [checkedItems]);

  return (
    <CatalogueItem
      show={show}
      nId={nft.nId}
      uniqueId={nft.nId}
      checked={checked}
      onCheckboxChange={onItemCheck}
      hasAction
      buttonTitle={checkedMoreThanOne && checked ? "Lend all" : "Lend"}
      onClick={handleStartLend}
    />
  );
};

const ItemsRenderer: React.FC<{
  currentPage: (Nft & { show: boolean })[];
  pageItems: Nft[];
}> = ({ currentPage, pageItems }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { checkedItems, onCheckboxChange } = useBatchItems("lend", pageItems);
  const handleClose = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  const handleBatchModalOpen = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

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
        <BatchLendModal
          checkedItems={checkedItems}
          open={modalOpen}
          onClose={handleClose}
        />
      )}
      <ItemWrapper>
        {currentPage.map((nft: Nft & { show: boolean }) => (
          <LendCatalagoueItem
            nft={nft}
            show={nft.show}
            key={nft.id}
            checkedItems={checkedItems}
            onItemCheck={onItemCheck(nft)}
            handleStartLend={handleBatchModalOpen}
          />
        ))}
      </ItemWrapper>
    </div>
  );
};

const Lendings: React.FC = () => {
  const { signer } = useWallet();
  const { allAvailableToLend, isLoading } = useAllAvailableToLend();

  //TODO:eniko move this to the search-layout
  const filteredItems = useSearch(allAvailableToLend);

  if (!signer) {
    return (
      <LendSearchLayout>
        <NoSignerMessage />
      </LendSearchLayout>
    );
  }

  return (
    <LendSearchLayout>
      <PaginationList
        nfts={filteredItems}
        ItemsRenderer={ItemsRenderer}
        isLoading={isLoading}
        emptyResultMessage="You don't have any NFTs to lend"
      />
    </LendSearchLayout>
  );
};

export default Lendings;
