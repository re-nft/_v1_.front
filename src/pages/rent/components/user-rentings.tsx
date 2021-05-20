import React, { useCallback, useState, useEffect, useContext } from "react";

import { Renting } from "../../../contexts/graph/classes";
import { PaymentToken } from "../../../types";
import NumericField from "../../../components/numeric-field";
import CatalogueItem from "../../../components/catalogue-item";
import ItemWrapper from "../../../components/items-wrapper";
import ReturnModal from "../../../modals/return";
import ActionButton from "../../../components/action-button";
import CatalogueLoader from "../../../components/catalogue-loader";
import BatchBar from "../../../components/batch-bar";
import { BatchContext } from "../../../controller/batch-controller";
import GraphContext from "../../../contexts/graph";
import { Nft } from "../../../contexts/graph/classes";
import Pagination from "../../../components/pagination";
import { PageContext } from "../../../controller/page-controller";
import createCancellablePromise from "../../../contexts/create-cancellable-promise";
import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../../../consts";
import { NFTMetaContext } from "../../../contexts/NftMetaState";

const UserRentings: React.FC = () => {
  const {
    checkedItems,
    checkedMap,
    countOfCheckedItems,
    onReset,
    onSetCheckedItem,
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
  const { getUserRenting } = useContext(GraphContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [_, fetchNfts] = useContext(NFTMetaContext);

  const handleRefrash = useCallback(() => {
    getUserRenting()
      .then((userRenting: Renting[] | undefined) => {
        onSetItems(userRenting || []);
        onChangePage(userRenting || []);
        setIsLoading(false);
      })
      .catch(() => {
        console.warn("could not handle refresh");
      });
  }, [onSetItems, onChangePage, setIsLoading, getUserRenting]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    handleRefrash();
  }, [setModalOpen, handleRefrash]);

  const handleBatchStopRent = useCallback(() => {
    setModalOpen(true);
    handleRefrash();
  }, [setModalOpen, handleRefrash]);

  const handleOpenModal = useCallback(
    async (nft: Nft) => {
      onSetCheckedItem(nft);
      setModalOpen(true);
    },
    [setModalOpen, onSetCheckedItem]
  );

  useEffect(() => {
    setIsLoading(true);

    const getUserRentingRequest = createCancellablePromise(getUserRenting());

    getUserRentingRequest.promise
      .then((userRenting: Renting[] | undefined) => {
        onSetItems(userRenting || []);
        onChangePage(userRenting || []);
        setIsLoading(false);
      })
      .catch(() => {
        console.warn("could not get user renting request");
      });

    return () => {
      onResetPage();
      return getUserRentingRequest.cancel();
    };
    /* eslint-disable-next-line */
  }, []);
  //Prefetch metadata
  useEffect(() => {
    fetchNfts(currentPage);
  }, [currentPage, fetchNfts]);
  if (isLoading) {
    return <CatalogueLoader />;
  }

  if (!isLoading && currentPage.length === 0) {
    return <div className="center">You dont have any lend anything yet</div>;
  }

  // TODO: remove all the anys

  return (
    <>
      {modalOpen && (
        <ReturnModal
          open={modalOpen}
          // TODO: checkedItems have a lendingId?
          nfts={checkedItems.map((item) => ({ ...item, lendingId: "1" }))}
          onClose={handleCloseModal}
        />
      )}
      <ItemWrapper>
        {currentPage.map((nft: Nft, ix: number) => {
          const id = `${nft.address}${RENFT_SUBGRAPH_ID_SEPARATOR}${nft.tokenId}${ix}`;
          return (
            <CatalogueItem
              key={id}
              nft={nft}
              checked={checkedMap[nft.tokenId] || false}
            >
              <NumericField
                text="Daily price"
                value={String(0)}
                unit={PaymentToken[PaymentToken.DAI]}
              />
              <NumericField
                text="Rent Duration"
                value={String(0)}
                unit="days"
              />
              <ActionButton<Nft>
                title="Return It"
                nft={nft}
                onClick={handleOpenModal}
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
      {countOfCheckedItems > 1 && (
        <BatchBar
          title={`Selected ${countOfCheckedItems} items`}
          actionTitle="Stop Rents All"
          onCancel={onReset}
          onClick={handleBatchStopRent}
        />
      )}
    </>
  );
};

export default React.memo(UserRentings);
