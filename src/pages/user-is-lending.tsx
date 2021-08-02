import React, { useContext, useCallback, useEffect, useState } from "react";

import ItemWrapper from "../components/common/items-wrapper";
import { Lending, isLending } from "../contexts/graph/classes";
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
import LendingFields from "../components/lending-fields";
import { NFTMetaContext } from "../contexts/NftMetaState";
import { UserLendingContext } from "../contexts/UserLending";
import UserContext from "../contexts/UserProvider";
import { StopLendModal } from "../modals/stop-lend-modal";
import { LendSwitchWrapper } from "../components/lend-switch-wrapper";

const UserCurrentlyLending: React.FC = () => {
  const { signer } = useContext(UserContext);
  const {
    checkedItems,
    handleReset: batchHandleReset,
    checkedLendingItems,
    onCheckboxChange
  } = useBatchItems();
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onPageControllerInit
  } = usePageController<Lending>();
  const { userLending, isLoading } = useContext(UserLendingContext);
  const [_, fetchNfts] = useContext(NFTMetaContext);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    batchHandleReset();
  }, [batchHandleReset]);

  const handleOpenModal = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  const handleClickNft = useCallback(
    (nft: Lending) => {
      onCheckboxChange(nft);
      setModalOpen(true);
    },
    [onCheckboxChange]
  );

  useEffect(() => {
    let isSubscribed = true;
    if (isSubscribed) onPageControllerInit(userLending.filter(isLending));
    return () => {
      isSubscribed = false;
    };
  }, [onPageControllerInit, userLending]);

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
  if (isLoading && currentPage.length === 0)
    return (
      <LendSwitchWrapper>
        <CatalogueLoader />
      </LendSwitchWrapper>
    );
  if (!isLoading && currentPage.length === 0)
    return (
      <LendSwitchWrapper>
        <div className="center content__message">
          You are not lending anything yet
        </div>
      </LendSwitchWrapper>
    );

  // TODO: this bloody code is repeat of ./lendings.tsx
  return (
    <LendSwitchWrapper>
      {modalOpen && (
        <StopLendModal
          open={modalOpen}
          onClose={handleCloseModal}
          nfts={checkedLendingItems}
        />
      )}
      <ItemWrapper>
        {currentPage.map((nft: Lending) => {
          const hasRenting = !!nft.renting;
          const isChecked = !!checkedItems[getUniqueCheckboxId(nft)];
          return (
            <CatalogueItem
              key={getUniqueCheckboxId(nft)}
              checked={isChecked}
              nft={nft}
              onCheckboxChange={checkBoxChangeWrapped(nft)}
              disabled={hasRenting}
            >
              <LendingFields nft={nft} />
              <ActionButton<Lending>
                nft={nft}
                disabled={hasRenting || isChecked}
                title="Stop Lending"
                onClick={handleClickNft}
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
      {checkedLendingItems.length > 0 && (
        <BatchBar
          title={`Selected ${checkedLendingItems.length} items`}
          actionTitle="Stop Lending"
          onClick={handleOpenModal}
          onCancel={batchHandleReset}
        />
      )}
    </LendSwitchWrapper>
  );
};

export default UserCurrentlyLending;
