import React, { useState, useCallback, useContext } from "react";
import { Nft } from "../contexts/graph/classes";
import BatchLendModal from "../modals/batch-lend";
import { CatalogueItem } from "../components/catalogue-item";
import ActionButton from "../components/common/action-button";
import BatchBar from "../components/batch-bar";
import {
  getUniqueCheckboxId,
  useBatchItems
} from "../hooks/useBatchItems";
import { useAllAvailableToLend } from "../hooks/contract/useAllAvailableToLend";
import UserContext from "../contexts/UserProvider";
import { LendSwitchWrapper } from "../components/lend-switch-wrapper";
import { PaginationList } from "../components/pagination-list";

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
    async (nft: Nft) => {
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

  const renderChild = useCallback(
    (nft: Nft) => {
      const checked = !!checkedItems[getUniqueCheckboxId(nft)];

      return (
        <CatalogueItem
          key={getUniqueCheckboxId(nft)}
          nft={nft}
          checked={checked}
          onCheckboxChange={checkBoxChangeWrapped(nft)}
        >
          <ActionButton<Nft>
            nft={nft}
            title="Lend now"
            onClick={handleStartLend}
            disabled={checked}
          />
        </CatalogueItem>
      );
    },
    [checkedItems]
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
        renderItem={renderChild}
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
