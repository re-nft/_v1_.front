import React, { useState, useCallback, useMemo } from "react";
import { Nft } from "../types/classes";
import BatchLendModal from "../components/modals/batch-lend";
import { CatalogueItem } from "../components/catalogue-item";
import { useBatchItems } from "../hooks/misc/useBatchItems";
import { useAllAvailableToLend } from "../hooks/queries/useAllAvailableToLend";
import { LendSearchLayout } from "../components/layouts/lend-search-layout";
import { PaginationList } from "../components/layouts/pagination-list";
import ItemWrapper from "../components/common/items-wrapper";
import { useWallet } from "../hooks/store/useWallet";

const LendCatalagoueItem: React.FC<{
  checkedItems: string[];
  nft: Nft;
  checkBoxChangeWrapped: (nft: Nft) => () => void;
  handleStartLend: () => void;
  show: boolean;
}> = ({ checkedItems, nft, checkBoxChangeWrapped, handleStartLend, show }) => {
  const checked = useMemo(() => {
    const set = new Set(checkedItems);
    return set.has(nft.nId);
  }, [checkedItems, nft.nId]);

  const checkedMoreThanOne = useMemo(() => {
    return checkedItems.length > 1;
  }, [checkedItems]);
  return (
    <CatalogueItem
      show={show}
      nId={nft.nId}
      checked={checked}
      onCheckboxChange={checkBoxChangeWrapped(nft)}
      hasAction
      buttonTitle={checkedMoreThanOne && checked ? "Lend all" : "Lend"}
      onClick={handleStartLend}
    />
  );
};

const ItemsRenderer: React.FC<{ currentPage: (Nft & { show: boolean })[] }> = ({
  currentPage
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { checkedItems, handleReset, onCheckboxChange } = useBatchItems();
  const handleClose = useCallback(() => {
    setModalOpen(false);
    handleReset();
  }, [setModalOpen, handleReset]);

  const handleBatchModalOpen = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

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
            checkBoxChangeWrapped={checkBoxChangeWrapped}
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

  if (!signer) {
    return (
      <LendSearchLayout>
        <div className="text-center text-lg text-white font-display py-32 leading-tight">
          Please connect your wallet!
        </div>
      </LendSearchLayout>
    );
  }

  return (
    <LendSearchLayout>
      <PaginationList
        nfts={allAvailableToLend}
        ItemsRenderer={ItemsRenderer}
        isLoading={isLoading}
        emptyResultMessage="You don't have any NFTs to lend"
      />
    </LendSearchLayout>
  );
};

export default Lendings;
