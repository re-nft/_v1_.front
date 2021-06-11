import React, { useCallback, useState, useEffect, useContext } from "react";

import { Renting } from "../../../contexts/graph/classes";
import { PaymentToken } from "../../../types";
import NumericField from "../../../components/numeric-field";
import CatalogueItem from "../../../components/catalogue-item";
import ItemWrapper from "../../../components/items-wrapper";
import ReturnModal from "../../../modals/return-modal";
import ActionButton from "../../../components/action-button";
import CatalogueLoader from "../../../components/catalogue-loader";
import BatchBar from "../../../components/batch-bar";
import {
  getUniqueCheckboxId,
  useBatchItems,
} from "../../../controller/batch-controller";
import { Nft } from "../../../contexts/graph/classes";
import Pagination from "../../../components/pagination";
import { NFTMetaContext } from "../../../contexts/NftMetaState";
import { UserRentingContext } from "../../../contexts/UserRenting";
import { usePageController } from "../../../controller/page-controller";
import { nftReturnIsExpired } from "../../../utils";

const UserRentings: React.FC = () => {
  const {
    checkedItems,
    handleReset: handleBatchReset,
    onCheckboxChange,
    checkedRentingItems,
  } = useBatchItems();
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onPageControllerInit,
  } = usePageController<Renting>();
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
    onPageControllerInit(userRenting.filter((nft) => nft.renting));
  }, [onPageControllerInit, userRenting]);

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

  if (isLoading && currentPage.length === 0) {
    return <CatalogueLoader />;
  }

  if (!isLoading && currentPage.length === 0) {
    return <div className="center">You are not renting anything yet</div>;
  }

  return (
    <>
      {modalOpen && (
        <ReturnModal
          open={modalOpen}
          nfts={checkedRentingItems}
          onClose={handleCloseModal}
        />
      )}
      <ItemWrapper>
        {currentPage.length > 0 &&
          currentPage.map((nft: Renting) => {
            const id = getUniqueCheckboxId(nft);
            const checked = !!checkedItems[id];
            const isExpired = nftReturnIsExpired(nft);

            return (
              <CatalogueItem
                key={id}
                nft={nft}
                checked={checked}
                disabled={isExpired}
                onCheckboxChange={checkBoxChangeWrapped(nft)}
              >
                <NumericField
                  text="Daily price"
                  value={nft.lending.dailyRentPrice.toString()}
                  unit={PaymentToken[PaymentToken.DAI]}
                />
                <NumericField
                  text="Rent Duration"
                  value={nft.renting.rentDuration.toString()}
                  unit="days"
                />
                <ActionButton<Nft>
                  title="Return It"
                  disabled={isExpired}
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
