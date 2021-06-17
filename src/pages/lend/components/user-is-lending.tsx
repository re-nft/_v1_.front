import React, { useContext, useCallback, useEffect } from "react";

import ItemWrapper from "../../../components/items-wrapper";
import { Lending, isLending } from "../../../contexts/graph/classes";
import CatalogueItem from "../../../components/catalogue-item";
import ActionButton from "../../../components/action-button";
import CatalogueLoader from "../../../components/catalogue-loader";
import BatchBar from "../../../components/batch-bar";
import {
  getUniqueCheckboxId,
  useBatchItems,
} from "../../../controller/batch-controller";
import Pagination from "../../../components/pagination";
import { usePageController } from "../../../controller/page-controller";
import LendingFields from "../../../components/lending-fields";
import { NFTMetaContext } from "../../../contexts/NftMetaState";
import { useStopLend } from "../../../hooks/useStopLend";
import createCancellablePromise from "../../../contexts/create-cancellable-promise";
import { UserLendingContext } from "../../../contexts/UserLending";
import UserContext from "../../../contexts/UserProvider";

const UserCurrentlyLending: React.FC = () => {
  const { signer } = useContext(UserContext);
  const {
    checkedItems,
    handleReset: batchHandleReset,
    checkedLendingItems,
    onCheckboxChange,
  } = useBatchItems();
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onPageControllerInit,
  } = usePageController<Lending>();
  const { userLending, isLoading } = useContext(UserLendingContext);
  const [_, fetchNfts] = useContext(NFTMetaContext);
  const stopLending = useStopLend();

  const handleStopLend = useCallback(
    async (nfts: Lending[]) => {
      const transaction = createCancellablePromise(
        stopLending(nfts.map((nft) => ({ ...nft, lendingId: nft.lending.id })))
      );

      transaction.promise.then((status) => {
        if (status) batchHandleReset();
      });

      return transaction.cancel;
    },

    [stopLending, batchHandleReset]
  );

  const handleClickNft = useCallback(
    (nft: Lending) => {
      handleStopLend([nft]);
    },
    [handleStopLend]
  );

  const handleBatchStopnLend = useCallback(async () => {
    handleStopLend(checkedLendingItems);
  }, [handleStopLend, checkedLendingItems]);

  useEffect(() => {
    onPageControllerInit(userLending.filter(isLending));
  }, [onPageControllerInit, userLending]);

  //Prefetch metadata
  useEffect(() => {
    fetchNfts(currentPage);
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
    return <div className="center">Please connect your wallet!</div>;
  }
  if (isLoading && currentPage.length === 0) return <CatalogueLoader />;
  if (!isLoading && currentPage.length === 0)
    return <div className="center">You are not lending anything yet</div>;

  // TODO: this bloody code is repeat of ./lendings.tsx
  return (
    <>
      <ItemWrapper>
        {currentPage.map((nft: Lending) => {
          const hasRenting = !!nft.renting;
          return (
            <CatalogueItem
              key={getUniqueCheckboxId(nft)}
              checked={!!checkedItems[getUniqueCheckboxId(nft)]}
              nft={nft}
              onCheckboxChange={checkBoxChangeWrapped(nft)}
              disabled={hasRenting}
            >
              <LendingFields nft={nft} />
              <ActionButton<Lending>
                nft={nft}
                disabled={hasRenting}
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
      {checkedLendingItems.length > 1 && (
        <BatchBar
          title={`Selected ${checkedLendingItems.length} items`}
          actionTitle="Stop Lending"
          onClick={handleBatchStopnLend}
          onCancel={batchHandleReset}
        />
      )}
    </>
  );
};

export default React.memo(UserCurrentlyLending);
