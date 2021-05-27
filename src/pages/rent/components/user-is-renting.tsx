import React, {
  useCallback,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";

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
  useCheckedRentingItems,
} from "../../../controller/batch-controller";
import { Nft } from "../../../contexts/graph/classes";
import Pagination from "../../../components/pagination";
import { PageContext } from "../../../controller/page-controller";
import { NFTMetaContext } from "../../../contexts/NftMetaState";
import { UserRentingContext } from "../../../contexts/UserRenting";

const UserRentings: React.FC = () => {
  const {
    checkedItems,
    handleReset: handleBatchReset,
    onCheckboxChange,
  } = useContext(BatchContext);
  const checkedRentingItems = useCheckedRentingItems();
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onResetPage,
    onChangePage,
  } = useContext(PageContext);
  const { userRenting, isLoading } = useContext(UserRentingContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [_, fetchNfts] = useContext(NFTMetaContext);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  const handleBatchStopRent = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  const handleReturnNft = useCallback(
    (nft) => {
      onCheckboxChange(nft);
      setModalOpen(true);
    },
    [onCheckboxChange]
  );

  useEffect(() => {
    onChangePage(userRenting);
  }, [onChangePage, userRenting]);

  //Prefetch metadata
  useEffect(() => {
    fetchNfts(currentPage);
  }, [currentPage, fetchNfts]);

  const returnItems = useMemo(() => {
    return checkedRentingItems.map((item) => ({
      id: item.id,
      address: item.address,
      tokenId: item.tokenId,
      lendingId: item.renting.lendingId,
      amount: item.renting.lending.lentAmount,
      contract: item.contract,
    }));
  }, [checkedRentingItems]);

  
  if (isLoading && currentPage.length === 0) {
    return <CatalogueLoader />;
  }

  if (!isLoading && currentPage.length === 0) {
    return <div className="center">You are not renting anything yet</div>;
  }

  //TODO:eniko after returning the nft it returns is as Lending not REnting
  //TODO remove the filter bellow
  // TODO: remove all the anys
  return (
    <>
      {modalOpen && (
        <ReturnModal
          open={modalOpen}
          nfts={returnItems}
          onClose={handleCloseModal}
        />
      )}
      <ItemWrapper>
        {/* 
          TODO: this is wild, this should not be any (about currentPage)
        */}
        {currentPage.length > 0 &&
          currentPage
          // it's with page change, lending is still there
            .filter((r) => r.renting)
            .map((nft: Renting) => {
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
                      getUniqueID(
                        nft.address,
                        nft.tokenId,
                        nft.renting.lendingId
                      )
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
                    onClick={() => handleReturnNft(nft)}
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
