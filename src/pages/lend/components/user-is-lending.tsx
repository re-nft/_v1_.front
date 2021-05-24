import React, { useContext, useCallback, useState, useEffect } from "react";

import { ReNFTContext } from "../../../hardhat/SymfoniContext";
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
  useCheckedLendingItems,
} from "../../../controller/batch-controller";
import Pagination from "../../../components/pagination";
import { PageContext } from "../../../controller/page-controller";
import LendingFields from "../../../components/lending-fields";
import { NFTMetaContext } from "../../../contexts/NftMetaState";
import { useUserLending } from "../../../contexts/graph/hooks/useUserLending";

const UserCurrentlyLending: React.FC = () => {
  const { checkedItems, handleReset: batchHandleReset } =
    useContext(BatchContext);
  const checkedLendingItems = useCheckedLendingItems();
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onResetPage,
    onChangePage,
  } = useContext(PageContext);
  const { instance: renft } = useContext(ReNFTContext);
  const { userLending, isLoading } = useUserLending();
  const { setHash } = useContext(TransactionStateContext);
  const [_, fetchNfts] = useContext(NFTMetaContext);

  const handleReset = useCallback(() => {
    //TODO:eniko
    //refetch lending
  }, []);

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
    onChangePage(userLending);
  }, [onChangePage, userLending]);

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
