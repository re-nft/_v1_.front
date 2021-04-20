import React, { useContext, useCallback, useState, useEffect } from "react";

import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../../../consts";
import { RentNftContext } from "../../../hardhat/SymfoniContext";
import GraphContext from "../../../contexts/graph";
import ItemWrapper from "../../../components/items-wrapper";
import { Lending, Nft } from "../../../contexts/graph/classes";
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
  const {
    checkedItems,
    checkedMap,
    countOfCheckedItems,
    onReset,
    onCheckboxChange,
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
  const { instance: renft } = useContext(RentNftContext);
  const { setHash } = useContext(TransactionStateContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleReset = useCallback(() => {
    getUserLending().then((userLnding: Lending[] | undefined) => {
      onChangePage(userLnding || []);
      onSetItems(userLnding || []);
      setIsLoading(false);
    });
  }, [getUserLending, onChangePage, onSetItems, setIsLoading]);

  const handleStopLend = useCallback(
    async (nfts: Nft[]) => {
      if (!renft) return;
      const tx = await stopLend(renft, nfts);
      await setHash(tx.hash);
      onReset();
      handleReset();
    },
    [renft, setHash, handleReset]
  );

  const handleClickNft = useCallback(async (nft: Nft) => {
    handleStopLend([nft]);
  }, []);

  const handleBatchStopnLend = useCallback(async () => {
    handleStopLend(checkedItems);
  }, [handleStopLend, checkedItems]);

  useEffect(() => {
    setIsLoading(true);

    const getUserLendingRequest = createCancellablePromise(getUserLending());

    getUserLendingRequest.promise.then((userLnding: Lending[] | undefined) => {
      onChangePage(userLnding || []);
      onSetItems(userLnding || []);
      setIsLoading(false);
    });

    return () => {
      onResetPage();
      return getUserLendingRequest.cancel();
    };
    /* eslint-disable-next-line */
  }, []);

  if (isLoading) {
    return <CatalogueLoader />;
  }

  if (!isLoading && currentPage.length === 0) {
    return <div className="center">You dont have any lend anything yet</div>;
  }
  console.log(currentPage);
  return (
    <>
      <ItemWrapper>
        {
          // TODO: where did any come from here. punish it
        }
        {((currentPage as any) as Lending[]).map((nft: Lending) => (
          <CatalogueItem
            key={`${nft.address}${RENFT_SUBGRAPH_ID_SEPARATOR}${nft.tokenId}`}
            checked={checkedMap[nft.tokenId] || false}
            nft={nft}
            onCheckboxChange={onCheckboxChange}
          >
            <LendingFields nft={nft} />
            <ActionButton<Nft>
              nft={nft}
              title="Stop Lending"
              onClick={handleClickNft}
            />
          </CatalogueItem>
        ))}
      </ItemWrapper>
      <Pagination
        totalPages={totalPages}
        currentPageNumber={currentPageNumber}
        onSetPage={onSetPage}
      />
      {countOfCheckedItems > 1 && (
        <BatchBar
          title={`Batch process ${countOfCheckedItems} items`}
          actionTitle="Stop Lending"
          onClick={handleBatchStopnLend}
          onCancel={onReset}
        />
      )}
    </>
  );
};

export default React.memo(UserLendings);
