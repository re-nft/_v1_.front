import React, { useContext, useCallback, useState, useEffect } from "react";

import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../../../consts";
import { ReNFTContext } from "../../../hardhat/SymfoniContext";
import GraphContext from "../../../contexts/graph";
import ItemWrapper from "../../../components/items-wrapper";
import { Lending, Nft, isLending } from "../../../contexts/graph/classes";
import { TransactionStateContext } from "../../../contexts/TransactionState";
import CatalogueItem from "../../../components/catalogue-item";
import ActionButton from "../../../components/action-button";
import stopLend from "../../../services/stop-lending";
import CatalogueLoader from "../../../components/catalogue-loader";
import BatchBar from "../../../components/batch-bar";
import { BatchContext } from "../../../controller/batch-controller";
import Pagination from "../../../components/pagination";
import { PageContext } from "../../../controller/page-controller";
import createCancellablePromise from "../../../contexts/create-cancellable-promise";
import LendingFields from "../../../components/lending-fields";

const UserLendings: React.FC = () => {
  // what's the point of getting onCheckboxChange from context here and passing as props into CatalogueItem
  // you can just get it from context inside of CatalogueItem
  const {
    checkedLendingItems,
    checkedMap,
    countOfCheckedItems,
    onReset,
    onSetItems,
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

  const handleReset = useCallback(() => {
    getUserLending()
      .then((userLnding: Lending[] | undefined) => {
        onChangePage(userLnding || []);
        onSetItems(userLnding || []);
        setIsLoading(false);
      })
      .catch(() => {
        console.warn("could not handle reset");
      });
  }, [getUserLending, onChangePage, onSetItems, setIsLoading]);

  const handleStopLend = useCallback(
    async (nfts: Lending[]) => {
      if (!renft) return;
      const tx = await stopLend(
        renft,
        nfts.map((nft) => ({ ...nft, lendingId: nft.lending.id }))
      );
      await setHash(tx.hash);
      onReset();
      handleReset();
    },
    [renft, setHash, handleReset, onReset]
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
      .then((userLnding: Lending[] | undefined) => {
        onChangePage(userLnding || []);
        onSetItems(userLnding || []);
        setIsLoading(false);
      })
      .catch(() => {
        console.warn("could not get userLending request");
      });

    return () => {
      onResetPage();
      return getUserLendingRequest.cancel();
    };
    /* eslint-disable-next-line */
  }, []);

  if (isLoading) return <CatalogueLoader />;
  if (!isLoading && currentPage.length === 0)
    return <div className="center">You dont have any lend anything yet</div>;

  return (
    <>
      <ItemWrapper>
        {currentPage.map((nft: Nft | Lending, ix: number) => {
          if (isLending(nft)) {
            return (
              <CatalogueItem
                key={`${nft.address}${RENFT_SUBGRAPH_ID_SEPARATOR}${nft.tokenId}${ix}`}
                checked={checkedMap[nft.tokenId] || false}
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
      {countOfCheckedItems > 1 && (
        <BatchBar
          title={`Selected ${countOfCheckedItems} items`}
          actionTitle="Stop Lending"
          onClick={handleBatchStopnLend}
          onCancel={onReset}
        />
      )}
    </>
  );
};

export default React.memo(UserLendings);
