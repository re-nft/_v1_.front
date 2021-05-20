import React, { useContext, useCallback, useState, useEffect } from "react";

import { ReNFTContext } from "../../../hardhat/SymfoniContext";
import GraphContext from "../../../contexts/graph";
import ItemWrapper from "../../../components/items-wrapper";
import { Lending, Nft, isLending } from "../../../contexts/graph/classes";
import { TransactionStateContext } from "../../../contexts/TransactionState";
import CatalogueItem from "../../../components/catalogue-item";
import ActionButton from "../../../components/action-button";
import stopLend from "../../../services/stop-lend";
import CatalogueLoader from "../../../components/catalogue-loader";
import BatchBar from "../../../components/batch-bar";
import {
  BatchContext,
  getUniqueID,
} from "../../../controller/batch-controller";
import Pagination from "../../../components/pagination";
import { PageContext } from "../../../controller/page-controller";
import createCancellablePromise from "../../../contexts/create-cancellable-promise";
import LendingFields from "../../../components/lending-fields";
import { NFTMetaContext } from "../../../contexts/NftMetaState";

const UserCurrentlyLending: React.FC = () => {
  const {
    checkedItems,
    checkedLendingItems,
    handleReset: batchHandleReset,
  } = useContext(BatchContext);
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onResetPage,
    onChangePage,
  } = useContext(PageContext);
  const { getUserLending } = useContext(GraphContext);
  const { instance: renft } = useContext(ReNFTContext);
  const { setHash } = useContext(TransactionStateContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [_, fetchNfts] = useContext(NFTMetaContext);

  const handleReset = useCallback(() => {
    getUserLending()
      .then((userLnding: Lending[] | undefined) => {
        onChangePage(userLnding || []);
        setIsLoading(false);
      })
      .catch(() => {
        console.warn("could not handle reset");
      });
  }, [getUserLending, onChangePage, setIsLoading]);

  const handleStopLend = useCallback(
    async (nfts: Lending[]) => {
      if (!renft) return;

      const tx = await stopLend(
        renft,
        nfts.map((nft) => ({ ...nft, lendingId: nft.lending.id }))
      );

      await setHash(tx.hash);

      batchHandleReset();
      handleReset();
    },

    [renft, setHash, handleReset, batchHandleReset]
  );

  const handleClickNft = useCallback(
    async (nft: Lending) => {
      handleStopLend([nft]);
    },
    [handleStopLend]
  );

  const handleBatchStopnLend = useCallback(async () => {
    handleStopLend(checkedLendingItems);
  }, [handleStopLend, checkedLendingItems]);

  useEffect(() => {
    setIsLoading(true);

    const getUserLendingRequest = createCancellablePromise(getUserLending());

    getUserLendingRequest.promise
      .then((lendings) => {
        onChangePage(lendings || []);
        setIsLoading(false);
      })
      .catch((e) => {
        console.warn(e);
        console.warn("could not get user Lending request");
      });

    return () => {
      onResetPage();
      return getUserLendingRequest.cancel();
    };
    /* eslint-disable-next-line */
  }, []);

  //Prefetch metadata
  useEffect(() => {
    fetchNfts(currentPage);
  }, [currentPage, fetchNfts]);
  if (isLoading) return <CatalogueLoader />;
  if (!isLoading && currentPage.length === 0)
    return <div className="center">You dont have any lend anything yet</div>;

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
