import React, { useContext, useCallback, useEffect } from "react";

import { SignerContext } from "../../../hardhat/SymfoniContext";
import ItemWrapper from "../../../components/items-wrapper";
import { Lending, Nft, isLending } from "../../../contexts/graph/classes";
import { TransactionStateContext } from "../../../contexts/TransactionState";
import CatalogueItem from "../../../components/catalogue-item";
import ActionButton from "../../../components/action-button";
import CatalogueLoader from "../../../components/catalogue-loader";
import BatchBar from "../../../components/batch-bar";
import {
  BatchContext,
  getUniqueID,
  useCheckedLendingItems,
} from "../../../controller/batch-controller";
import Pagination from "../../../components/pagination";
import { PageContext } from "../../../controller/page-controller";
import LendingFields from "../../../components/lending-fields";
import { NFTMetaContext } from "../../../contexts/NftMetaState";
import { useStopLend } from "../../../hooks/useStopLend";
import createCancellablePromise from "../../../contexts/create-cancellable-promise";
import { UserLendingContext } from "../../../contexts/UserLending";

const UserCurrentlyLending: React.FC = () => {
  const { checkedItems, handleReset: batchHandleReset } =
    useContext(BatchContext);
  const checkedLendingItems = useCheckedLendingItems();
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onChangePage,
  } = useContext(PageContext);
  const [signer] = useContext(SignerContext);
  const { userLending, isLoading } = useContext(UserLendingContext);
  const { setHash } = useContext(TransactionStateContext);
  const [_, fetchNfts] = useContext(NFTMetaContext);
  const stopLending = useStopLend();

  const handleStopLend = useCallback(
    async (nfts: Lending[]) => {
      if (!signer) return;

      const transaction = createCancellablePromise(
        stopLending(signer, nfts.map((nft) => ({ ...nft, lendingId: nft.lending.id })))
      );

      transaction.promise.then((tx) => {
        if (tx) setHash(tx.hash);
        batchHandleReset();
      });

      return transaction.cancel;
    },

    [stopLending, setHash, batchHandleReset, signer]
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
    onChangePage(userLending);
  }, [onChangePage, userLending]);

  //Prefetch metadata
  useEffect(() => {
    fetchNfts(currentPage);
  }, [currentPage, fetchNfts]);
  if (isLoading) return <CatalogueLoader />;
  if (!isLoading && currentPage.length === 0)
    return <div className="center">You are not lending anything yet</div>;

  // TODO: this bloody code is repeat of ./lendings.tsx
  return (
    <>
      <ItemWrapper>
        {/* 
          TODO: how the f is currentPage  any !?
        */}
        {currentPage.map((nft: Nft | Lending) => {
          if (isLending(nft)) {
            return (
              <CatalogueItem
                key={getUniqueID(nft.address, nft.tokenId, nft.lending.id)}
                checked={
                  !!checkedItems[
                    getUniqueID(nft.address, nft.tokenId, nft.lending.id)
                  ]
                }
                nft={nft}
              >
                <LendingFields nft={nft} />
                <ActionButton<Lending>
                  nft={nft}
                  title="Stop Lending"
                  onClick={handleClickNft}
                />
              </CatalogueItem>
            );
          }
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
