import React, { useState, useCallback, useContext } from "react";
import { Lending, Nft, Renting } from "../contexts/graph/classes";
import BatchLendModal from "../modals/batch-lend";
import { CatalogueItem } from "../components/catalogue-item";
import ActionButton from "../components/common/action-button";
import BatchBar from "../components/batch-bar";
import { useBatchItems } from "../hooks/useBatchItems";
import { useAllAvailableToLend } from "../hooks/useAllAvailableToLend";
import UserContext from "../contexts/UserProvider";
import { LendSwitchWrapper } from "../components/lend-switch-wrapper";
import { PaginationList } from "../components/pagination-list";
import { UniqueID } from "../utils";
import ItemWrapper from "../components/common/items-wrapper";
import { useSearch } from "../hooks/useSearch";

const LendCatalagoueItem: React.FC<{
  checkedItems: Record<UniqueID, Nft | Lending | Renting>;
  nft: Nft;
  checkBoxChangeWrapped: (nft: Nft) => () => void;
  handleStartLend: (nft: Nft) => () => void;
}> = ({ checkedItems, nft, checkBoxChangeWrapped, handleStartLend }) => {
  const checked = !!checkedItems[nft.id];

  return (
    <CatalogueItem
      nft={nft}
      checked={checked}
      onCheckboxChange={checkBoxChangeWrapped(nft)}
    >
      <ActionButton<Nft>
        nft={nft}
        title="Lend now"
        onClick={handleStartLend(nft)}
        disabled={checked}
      />
    </CatalogueItem>
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
      <ItemWrapper>
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
  const { signer } = useContext(UserContext);
  const { allAvailableToLend, isLoading } = useAllAvailableToLend();
  const items = useSearch(allAvailableToLend);

  if (!signer) {
    return (
      <LendSwitchWrapper>
        <div className="center content__message">
          Please connect your wallet!
        </div>
      </LendSwitchWrapper>
    );
  }

  return (
    <LendSwitchWrapper>
      <PaginationList
        nfts={items}
        ItemsRenderer={ItemsRenderer}
        isLoading={isLoading}
        emptyResultMessage="You don't have any NFTs to lend"
      />
    </LendSwitchWrapper>
  );
};

export default Lendings;
