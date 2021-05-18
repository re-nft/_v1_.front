import React, { useCallback, useState, useContext, useEffect } from "react";

import {
  CurrentAddressContext,
  ReNFTContext,
  SignerContext,
  ResolverContext,
} from "../../../hardhat/SymfoniContext";
import { PaymentToken } from "../../../types";
import CatalogueItem from "../../../components/catalogue-item";
import ItemWrapper from "../../../components/items-wrapper";
import BatchRentModal from "../../../modals/batch-rent";
import ActionButton from "../../../components/action-button";
import startRent from "../../../services/start-rent";
import CatalogueLoader from "../../../components/catalogue-loader";
import { TransactionStateContext } from "../../../contexts/TransactionState";
import GraphContext from "../../../contexts/graph";
import { Lending, Nft, isLending } from "../../../contexts/graph/classes";
import BatchBar from "../../../components/batch-bar";
import {
  BatchContext,
  getUniqueID,
} from "../../../controller/batch-controller";
import Pagination from "../../../components/pagination";
import { PageContext } from "../../../controller/page-controller";
import createCancellablePromise from "../../../contexts/create-cancellable-promise";
import LendingFields from "../../../components/lending-fields";

// TODO: this f code is also the repeat of user-lendings and lendings
const AvailableToRent: React.FC = () => {
  const {
    checkedItems,
    checkedLendingItems,
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
  const [isOpenBatchModel, setOpenBatchModel] = useState(false);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(ReNFTContext);
  const [signer] = useContext(SignerContext);
  const { instance: resolver } = useContext(ResolverContext);
  const { getUsersLending } = useContext(GraphContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isActive, setHash } = useContext(TransactionStateContext);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    getUsersLending()
      .then((items: Lending[] | undefined) => {
        onChangePage(items || []);
        setIsLoading(false);
      })
      .catch(() => {
        console.warn("could not get user lending");
      });
  }, [setIsLoading, getUsersLending, onChangePage]);

  const handleBatchModalClose = useCallback(() => {
    setOpenBatchModel(false);
    handleBatchReset();
    handleRefresh();
  }, [handleBatchReset, setOpenBatchModel, handleRefresh]);

  const handleBatchModalOpen = useCallback(
    (nft: Lending) => {
      setOpenBatchModel(true);
    },
    [setOpenBatchModel]
  );

  const handleRent = useCallback(
    async (nft: Lending[], { rentDuration }: { rentDuration: string[] }) => {
      if (
        nft.length === 0 ||
        !currentAddress ||
        !renft ||
        !signer ||
        !resolver ||
        isActive
      )
        return;

      // TODO: how come this is not in one of those services, even though everything else that is handling the contracts is, wtf
      const pmtToken = PaymentToken.DAI;
      const tx = await startRent(
        renft,
        nft,
        resolver,
        currentAddress,
        signer,
        rentDuration,
        pmtToken
      );
      if (tx) setHash(tx.hash);
      handleBatchModalClose();
    },
    [
      renft,
      currentAddress,
      signer,
      resolver,
      handleBatchModalClose,
      isActive,
      setHash,
    ]
  );

  const handleBatchRent = useCallback(() => {
    setOpenBatchModel(true);
  }, [setOpenBatchModel]);

  useEffect(() => {
    setIsLoading(true);

    const getUsersLendingRequest = createCancellablePromise(getUsersLending());

    getUsersLendingRequest.promise
      .then((usersLnding: Lending[] | undefined) => {
        onChangePage(usersLnding || []);
        setIsLoading(false);
      })
      .catch(() => {
        console.warn("could not get usersLending request");
      });

    return () => {
      onResetPage();
      return getUsersLendingRequest.cancel();
    };
    /* eslint-disable-next-line */
  }, []);

  if (isLoading) return <CatalogueLoader />;
  if (!isLoading && currentPage.length === 0)
    return <div className="center">You dont have any lend anything yet</div>;

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
      {checkedRentingItems.length > 1 && (
        <BatchBar
          title={`Selected ${checkedRentingItems.length} items`}
          actionTitle="Rents All"
          onCancel={handleBatchReset}
          onClick={handleBatchRent}
        />
      )}
    </>
  );
};

export default React.memo(AvailableToRent);
