import React, { useState, useCallback, useContext } from "react";
import { Lending, Nft, Renting } from "../contexts/graph/classes";
import BatchLendModal from "../modals/batch-lend";
import { CatalogueItem } from "../components/catalogue-item";
import ActionButton from "../components/common/action-button";
import BatchBar from "../components/batch-bar";
import {
  getUniqueCheckboxId,
  UniqueID,
  useBatchItems
} from "../hooks/useBatchItems";
import { useAllAvailableToLend } from "../hooks/useAllAvailableToLend";
import UserContext from "../contexts/UserProvider";
import { LendSwitchWrapper } from "../components/lend-switch-wrapper";
import { PaginationList } from "../components/pagination-list";


const LendCatalagoueItem: React.FC<{
  checkedItems: Record<UniqueID, Nft | Lending | Renting>;
  nft: Nft,
  checkBoxChangeWrapped: (nft: Nft) => () => void,
  handleStartLend: (nft: Nft) =>() => void
}> = ({
  checkedItems,
  nft,
  checkBoxChangeWrapped,
  handleStartLend
}) => {
  const checked = !!checkedItems[getUniqueCheckboxId(nft)];

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
}

const Lendings: React.FC = () => {
  const { signer } = useContext(UserContext);
  const { checkedItems, handleReset, onCheckboxChange, checkedNftItems } =
    useBatchItems();
  const { allAvailableToLend, isLoading } = useAllAvailableToLend();
  const [modalOpen, setModalOpen] = useState(false);

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

  const renderEmptyResult = useCallback(()=>{
    return (<div className="center content__message">
        You don&apos;t have any NFTs to lend
      </div>
    )
  }, [])

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
      {modalOpen && (
        <BatchLendModal
          nfts={checkedNftItems}
          open={modalOpen}
          onClose={handleClose}
        />
      )}
      <PaginationList
        nfts={allAvailableToLend}
        Item={LendCatalagoueItem}
        itemProps={{
          checkedItems,
          checkBoxChangeWrapped,
          handleStartLend
        }}
        isLoading={isLoading}
        renderEmptyResult={renderEmptyResult}
      />
      {checkedNftItems.length > 0 && (
        <BatchBar
          title={`Selected ${checkedNftItems.length} items`}
          actionTitle="Lend All"
          onCancel={handleReset}
          onClick={handleBatchModalOpen}
        />
      )}
    </LendSwitchWrapper>
  );
};

export default Lendings;
