import React, { useCallback, useState, useContext, useEffect } from "react";

import {
  CurrentAddressContext,
  ReNFTContext,
  SignerContext,
  ResolverContext,
  // todo: remove for prod
  MyERC20Context,
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
import { Lending } from "../../../contexts/graph/classes";
import BatchBar from "../../../components/batch-bar";
import { BatchContext } from "../../../controller/batch-controller";
import Pagination from "../../../components/pagination";
import { PageContext } from "../../../controller/page-controller";
import createCancellablePromise from "../../../contexts/create-cancellable-promise";
import LendingFields from "../../../components/lending-fields";
import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../../../consts";

const AvailableToRent: React.FC = () => {
  const {
    checkedItems,
    checkedMap,
    countOfCheckedItems,
    onReset,
    onCheckboxChange,
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
  const [isOpenBatchModel, setOpenBatchModel] = useState(false);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(ReNFTContext);
  const [signer] = useContext(SignerContext);
  const { instance: resolver } = useContext(ResolverContext);
  const { instance: myERC20 } = useContext(MyERC20Context);
  const { getUsersLending } = useContext(GraphContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isActive, setHash } = useContext(TransactionStateContext);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    getUsersLending()
      .then((items: Lending[] | undefined) => {
        onChangePage(items || []);
        onSetItems(items || []);
        setIsLoading(false);
      })
      .catch(() => {
        console.warn("could not get user lending");
      });
  }, [setIsLoading, getUsersLending, onChangePage, onSetItems]);

  const handleBatchModalClose = useCallback(() => {
    setOpenBatchModel(false);
    onReset();
    handleRefresh();
  }, [onReset, setOpenBatchModel, handleRefresh]);

  const handleBatchModalOpen = useCallback(
    (nft: Lending) => {
      // @ts-ignore
      onSetCheckedItem(nft);
      setOpenBatchModel(true);
    },
    [onSetCheckedItem, setOpenBatchModel]
  );

  const handleRent = useCallback(
    async (nft: Lending[], { rentDuration }: { rentDuration: string[] }) => {
      if (
        nft.length === 0 ||
        !currentAddress ||
        !renft ||
        !signer ||
        !resolver ||
        !myERC20 ||
        isActive
      )
        return;

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
      // @ts-ignore
      setHash(tx.hash);
      handleBatchModalClose();
    },
    [renft, currentAddress, signer, resolver, myERC20, isActive, setHash]
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
        onSetItems(usersLnding || []);
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

  if (isLoading) {
    return <CatalogueLoader />;
  }

  if (!isLoading && currentPage.length === 0) {
    return <div className="center">You dont have any lend anything yet</div>;
  }

  // TODO: so many anys it hurts

  return (
    <>
      <BatchRentModal
        nft={(checkedItems as any) as Lending[]}
        open={isOpenBatchModel}
        onSubmit={handleRent}
        handleClose={handleBatchModalClose}
      />
      <ItemWrapper>
        {((currentPage as any) as Lending[]).map((nft: Lending, ix: number) => (
          <CatalogueItem
            key={`${nft.address}${RENFT_SUBGRAPH_ID_SEPARATOR}${nft.tokenId}${RENFT_SUBGRAPH_ID_SEPARATOR}${ix}`}
            nft={nft}
            checked={checkedMap[nft.tokenId] || false}
            onCheckboxChange={onCheckboxChange}
          >
            <LendingFields nft={nft} />
            <ActionButton<Lending>
              onClick={handleBatchModalOpen}
              nft={nft}
              title="Rent Now"
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
          title={`Selected ${countOfCheckedItems} items`}
          actionTitle="Rents All"
          onCancel={onReset}
          onClick={handleBatchRent}
        />
      )}
    </>
  );
};

export default React.memo(AvailableToRent);
