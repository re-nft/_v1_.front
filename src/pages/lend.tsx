import React, { useState, useCallback, useMemo } from "react";
import { Lending, Nft, Renting } from "../types/classes";
import BatchLendModal from "../components/modals/batch-lend";
import { CatalogueItem } from "../components/catalogue-item";
import BatchBar from "../components/batch-bar";
import { useBatchItems } from "../hooks/useBatchItems";
import { useAllAvailableToLend } from "../hooks/queries/useAllAvailableToLend";
import { LendSearchLayout } from "../components/lend-search-layout";
import { PaginationList } from "../components/pagination-list";
import { UniqueID } from "../utils";
import ItemWrapper from "../components/common/items-wrapper";
import { useWallet } from "../hooks/useWallet";

const LendCatalagoueItem: React.FC<{
  checkedItems: Record<UniqueID, Nft | Lending | Renting>;
  nft: Nft;
  checkBoxChangeWrapped: (nft: Nft) => () => void;
  handleStartLend: (nft: Nft) => () => void;
}> = ({ checkedItems, nft, checkBoxChangeWrapped, handleStartLend }) => {
  const checked = !!checkedItems[nft.id];
  const checkedMoreThanOne = useMemo(() => {
    return Object.values(checkedItems).filter((r) => !!r).length > 1;
  }, [checkedItems]);
  return (
    <CatalogueItem
      nId={nft.nId}
      checked={checked}
      onCheckboxChange={checkBoxChangeWrapped(nft)}
      hasAction
      buttonTitle={checkedMoreThanOne ? "Lend all" :"Lend"}
      onClick={handleStartLend(nft)}
    />
  );
};

const ItemsRenderer: React.FC<{ currentPage: Nft[] }> = ({ currentPage }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { checkedItems, handleReset, onCheckboxChange, checkedNftItems } =
    useBatchItems();
  const handleClose = useCallback(() => {
    setModalOpen(false);
    handleReset();
  }, [setModalOpen, handleReset]);

  const handleStartLend = useCallback(
    (nft: Nft) => () => {
      onCheckboxChange(nft);
      setModalOpen(true);
    },
    [setModalOpen, onCheckboxChange]
  );

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
          nfts={checkedNftItems}
          open={modalOpen}
          onClose={handleClose}
        />
      )}
      <ItemWrapper flipId={currentPage.map((c) => c.id).join("")}>
        {currentPage.map((nft: Nft) => (
          <LendCatalagoueItem
            nft={nft}
            key={nft.id}
            checkedItems={checkedItems}
            checkBoxChangeWrapped={checkBoxChangeWrapped}
            handleStartLend={handleStartLend}
          />
        ))}
      </ItemWrapper>
      {checkedNftItems.length > 0 && (
        <BatchBar
          title={`Selected ${checkedNftItems.length} items`}
          actionTitle="Lend All"
          onCancel={handleReset}
          onClick={handleBatchModalOpen}
        />
      )}
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
