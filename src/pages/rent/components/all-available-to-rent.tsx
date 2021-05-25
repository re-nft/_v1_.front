import React, { useCallback, useState, useContext, useEffect } from "react";

import {
  ReNFTContext,
  SignerContext,
  ResolverContext,
} from "../../../hardhat/SymfoniContext";
import { PaymentToken, TransactionStateEnum } from "../../../types";
import CatalogueItem from "../../../components/catalogue-item";
import ItemWrapper from "../../../components/items-wrapper";
import BatchRentModal from "../../../modals/batch-rent";
import ActionButton from "../../../components/action-button";
import startRent from "../../../services/start-rent";
import CatalogueLoader from "../../../components/catalogue-loader";
import { TransactionStateContext } from "../../../contexts/TransactionState";
import { Lending, Nft, isLending } from "../../../contexts/graph/classes";
import BatchBar from "../../../components/batch-bar";
import {
  BatchContext,
  getUniqueID,
  useCheckedLendingItems,
  useCheckedRentingItems,
} from "../../../controller/batch-controller";
import Pagination from "../../../components/pagination";
import { PageContext } from "../../../controller/page-controller";
import LendingFields from "../../../components/lending-fields";
import { CurrentAddressContextWrapper } from "../../../contexts/CurrentAddressContextWrapper";
import { NFTMetaContext } from "../../../contexts/NftMetaState";
import { usePrevious } from "../../../hooks/usePrevious";
import { useAllAvailableToRent } from "../../../contexts/graph/hooks/useAllAvilableToRent";
import allAvailableToLend from "../../lend/components/all-available-to-lend";

// TODO: this f code is also the repeat of user-lendings and lendings
const AvailableToRent: React.FC = () => {
  const {
    checkedItems,

    handleReset: handleBatchReset,
    onCheckboxChange,
  } = useContext(BatchContext);
  const checkedLendingItems = useCheckedLendingItems();
  const checkedRentingItems = useCheckedRentingItems();
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onResetPage,
    onChangePage,
  } = useContext(PageContext);
  const [isOpenBatchModel, setOpenBatchModel] = useState(false);
  const [currentAddress] = useContext(CurrentAddressContextWrapper);
  const [signer] = useContext(SignerContext);
  const { instance: resolver } = useContext(ResolverContext);
  const { allAvailableToRent, isLoading } = useAllAvailableToRent();
  const { isActive, setHash } = useContext(TransactionStateContext);
  const [_, fetchNfts] = useContext(NFTMetaContext);

  // refresh when state succeed after rent
  // nothing to do on reject
  // TODO:eniko manually have to force refetch or optimistically set data when rent/lent

  useEffect(() => {
    onChangePage(allAvailableToRent);
  }, [allAvailableToRent, onChangePage]);

  const handleBatchModalClose = useCallback(() => {
    setOpenBatchModel(false);
    handleBatchReset();
  }, [handleBatchReset, setOpenBatchModel]);

  const handleBatchModalOpen = useCallback(
    (nft: Lending) => {
      onCheckboxChange(nft);
      setOpenBatchModel(true);
    },
    [setOpenBatchModel, onCheckboxChange]
  );

  const handleRent = useCallback(
    async (nft: Lending[], { rentDuration }: { rentDuration: string[] }) => {
      if (
        nft.length === 0 ||
        !signer ||
        !resolver ||
        isActive
      )
        return;

      // // TODO: hardcoded payment token
      // // TODO: how come this is not in one of those services, even though everything else that is handling the contracts is, wtf
      // const pmtToken = PaymentToken.DAI;
      // const tx = await startRent(
      //   signer,
      //   resolver,
      //   [{
      //     address: nft.address,
      //     tokenId: string;
      //     amount: string;
      //     lendingId: string;
      //     rentDuration: string;
      //     paymentToken: pmtToken
      //   }]
      // );
      // if (tx) setHash(tx.hash);

      handleBatchModalClose();
    },
    [signer, resolver, handleBatchModalClose, isActive]
  );

  const handleBatchRent = useCallback(() => {
    setOpenBatchModel(true);
  }, [setOpenBatchModel]);

  //Prefetch metadata
  useEffect(() => {
    fetchNfts(currentPage);
  }, [currentPage, fetchNfts]);

  if (isLoading) return <CatalogueLoader />;
  if (!isLoading && currentPage.length === 0)
    return <div className="center">You can&nbsp;t rent anything yet</div>;

  return (
    <>
      <BatchRentModal
        nft={checkedLendingItems}
        open={isOpenBatchModel}
        onSubmit={handleRent}
        handleClose={handleBatchModalClose}
      />
      <ItemWrapper>
        {currentPage.map((nft: Lending | Nft) => {
          if (isLending(nft)) {
            return (
              <CatalogueItem
                key={getUniqueID(nft.address, nft.tokenId, nft.lending.id)}
                nft={nft}
                checked={
                  !!checkedItems[
                    getUniqueID(nft.address, nft.tokenId, nft.lending.id)
                  ]
                }
              >
                <LendingFields nft={nft} />
                <ActionButton<Lending>
                  onClick={handleBatchModalOpen}
                  nft={nft}
                  title="Rent Now"
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
          actionTitle="Rent All"
          onCancel={handleBatchReset}
          onClick={handleBatchRent}
        />
      )}
      {checkedRentingItems.length > 1 && (
        <BatchBar
          title={`Selected ${checkedRentingItems.length} items`}
          actionTitle="Rent All"
          onCancel={handleBatchReset}
          onClick={handleBatchRent}
        />
      )}
    </>
  );
};

export default React.memo(AvailableToRent);
