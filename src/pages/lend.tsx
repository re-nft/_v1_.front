import React, { useState, useCallback, useContext, useEffect } from "react";
import { Nft } from "../contexts/graph/classes";
import ItemWrapper from "../components/common/items-wrapper";
import BatchLendModal from "../modals/batch-lend";
import { CatalogueItem } from "../components/catalogue-item";
import ActionButton from "../components/common/action-button";
import CatalogueLoader from "../components/catalogue-loader";
import BatchBar from "../components/batch-bar";
import {
  getUniqueCheckboxId,
  useBatchItems
} from "../controller/batch-controller";
import Pagination from "../components/common/pagination";
import { usePageController } from "../controller/page-controller";
import { NFTMetaContext } from "../contexts/NftMetaState";
import { useAllAvailableToLend } from "../hooks/useAllAvailableToLend";
import UserContext from "../contexts/UserProvider";
import { LendSwitchWrapper } from "../components/lend-switch-wrapper";

const Lendings: React.FC = () => {
  const { signer } = useContext(UserContext);
  const { checkedItems, handleReset, onCheckboxChange, checkedNftItems } =
    useBatchItems();
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onPageControllerInit
  } = usePageController<Nft>();
  const { allAvailableToLend, isLoading } = useAllAvailableToLend();
  const [modalOpen, setModalOpen] = useState(false);
  const [_, fetchNfts] = useContext(NFTMetaContext);

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

  useEffect(() => {
    let isSubscribed = true;
    if (isSubscribed) onPageControllerInit(allAvailableToLend);
    return () => {
      isSubscribed = false;
    };
  }, [allAvailableToLend, onPageControllerInit]);

  //Prefetch metadata
  useEffect(() => {
    let isSubscribed = true;
    if (isSubscribed) fetchNfts(currentPage);
    return () => {
      isSubscribed = false;
    };
  }, [currentPage, fetchNfts]);

  const checkBoxChangeWrapped = useCallback(
    (nft) => {
      return () => {
        onCheckboxChange(nft);
      };
    },
    [onCheckboxChange]
  );

  if (!signer) {
    return (
      <LendSwitchWrapper>
        <div className="center content__message">
          Please connect your wallet!
        </div>
      </LendSwitchWrapper>
    );
  }

  if (isLoading && currentPage.length === 0) {
    return (
      <LendSwitchWrapper>
        <CatalogueLoader />
      </LendSwitchWrapper>
    );
  }

  if (!isLoading && currentPage.length === 0) {
    return (
      <LendSwitchWrapper>
        <div className="center content__message">
          You don&apos;t have any NFTs to lend
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
      <ItemWrapper>
        {currentPage.map((nft) => {
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
        })}
      </ItemWrapper>
      <Pagination
        totalPages={totalPages}
        currentPageNumber={currentPageNumber}
        onSetPage={onSetPage}
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
