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
import {
  BatchContext,
  getUniqueID,
} from "../../../controller/batch-controller";
import GraphContext from "../../../contexts/graph";
import { Nft } from "../../../contexts/graph/classes";
import Pagination from "../../../components/pagination";
import { PageContext } from "../../../controller/page-controller";
import createCancellablePromise from "../../../contexts/create-cancellable-promise";

const UserRentings: React.FC = () => {
  const {
    checkedItems,
    checkedRentingItems,
    handleReset: handleBatchReset,
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

  const handleRefrash = useCallback(() => {
    getUserRenting()
      .then((userRenting: Renting[] | undefined) => {
        onChangePage(userRenting || []);
        setIsLoading(false);
      })
      .catch(() => {
        console.warn("could not handle refresh");
      });
  }, [onChangePage, setIsLoading, getUserRenting]);

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
      setModalOpen(true);
    },
    [setModalOpen]
  );

  useEffect(() => {
    setIsLoading(true);

    const getUserRentingRequest = createCancellablePromise(getUserRenting());

    getUserRentingRequest.promise
      .then((userRenting: Renting[] | undefined) => {
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

  if (isLoading) return <CatalogueLoader />;
  if (!isLoading && currentPage.length === 0)
    return <div className="center">You dont have any lend anything yet</div>;

  // TODO: remove all the anys
  return (
    <>
      {modalOpen && (
        <ReturnModal
          open={modalOpen}
          nfts={checkedRentingItems.map((item) => ({
            address: item.address,
            tokenId: item.tokenId,
            lendingId: item.renting.lendingId,
            amount: item.renting.lending.lentAmount,
            contract: item.contract,
          }))}
          onClose={handleCloseModal}
        />
      )}
      <ItemWrapper>
        {/* 
          TODO: this is wild, this should not be any (about currentPage)
        */}
        {currentPage.map((nft: Renting) => {
          const id = getUniqueID(
            nft.address,
            nft.tokenId,
            nft.renting.lendingId
          );
          return (
            <CatalogueItem
              key={id}
              nft={nft}
              checked={
                !!checkedItems[
                  getUniqueID(nft.address, nft.tokenId, nft.renting.lendingId)
                ]
              }
            >
              <NumericField
                text="Daily price"
                value="0"
                unit={PaymentToken[PaymentToken.DAI]}
              />
              <NumericField text="Rent Duration" value="0" unit="days" />
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
      {checkedRentingItems.length > 1 && (
        <BatchBar
          title={`Selected ${checkedRentingItems.length} items`}
          actionTitle="Stop Rents All"
          onCancel={handleBatchReset}
          onClick={handleBatchStopRent}
        />
      )}
    </>
  );
};

export default React.memo(UserRentings);
