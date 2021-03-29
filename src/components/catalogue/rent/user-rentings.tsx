import React, { useCallback, useState, useEffect, useContext, useMemo } from "react";
import { Renting } from "../../../contexts/graph/classes";
import { PaymentToken } from "../../../types";
import NumericField from "../components/numeric-field";
import CatalogueItem from "../components/catalogue-item";
import ItemWrapper from '../../layout/items-wrapper';
import ReturnModal from "../modals/return";
import ActionButton from "../components/action-button";
import CatalogueLoader from "../components/catalogue-loader";
import BatchBar from '../components/batch-bar';
import {BatchContext} from '../../controller/batch-controller';
import GraphContext from "../../../contexts/graph";
import { Nft } from "../../../contexts/graph/classes";
import Pagination from '../components/pagination';
import {PageContext} from "../../controller/page-controller";
import createCancellablePromise from '../../../contexts/create-cancellable-promise';

const UserRentings: React.FC = () => {
  const { 
    checkedItems, 
    checkedMap, 
    countOfCheckedItems, 
    onReset, 
    onCheckboxChange, 
    onSetCheckedItem, 
    onSetItems 
  } = useContext(BatchContext);
  const { 
    totalPages, 
    currentPageNumber, 
    currentPage, 
    onSetPage, 
    onChangePage
  } = useContext(PageContext);
  const { getUserRenting } = useContext(GraphContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCloseModal = useCallback(() => setModalOpen(false), [setModalOpen]);
  const handleBatchStopRent = useCallback(() => setModalOpen(true), [setModalOpen]);
  const handleOpenModal = useCallback(
    async (nft: Nft) => {
      onSetCheckedItem(nft);
      setModalOpen(true);
    },
    [setModalOpen]
  );

  useEffect(() => {
    setIsLoading(true);

    const getUserRentingRequest = createCancellablePromise(getUserRenting());

    getUserRentingRequest.promise.then((userRenting: Renting[] | undefined) => {
        onChangePage(userRenting || []);
        onSetItems(userRenting || []);
        setIsLoading(false);
    });

    return getUserRentingRequest.cancel;
  }, []);

  if (isLoading) {
    return <CatalogueLoader />;
  }

  if (!isLoading && currentPage.length === 0) {
    return (
      <div className="center">
        You dont have any lend anything yet
      </div>
    )
  }

  return (
    <>
      {modalOpen && (
        <ReturnModal
          open={modalOpen}
          nfts={checkedItems as any as Renting[]}
          onClose={handleCloseModal}
        />
      )}
      <ItemWrapper>
        {currentPage.map((nft: Nft) => {
          const id = `${nft.address}::${nft.tokenId}`;
          return (
            <CatalogueItem 
              key={id} 
              nft={nft}
              checked={checkedMap[nft.tokenId] || false}
              onCheckboxChange={onCheckboxChange}
            >
              <NumericField
                text="Daily price"
                value={String(0)}
                unit={PaymentToken[PaymentToken.DAI]}
              />
              <NumericField text="Rent Duration" value={String(0)} unit="days" />
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
          title={`Batch ${countOfCheckedItems} stop rents`} 
          actionTitle="Stop Rents All" 
          onCancel={onReset} 
          onClick={handleBatchStopRent} 
        />
      )}
    </>
  );
};

export default React.memo(UserRentings);
