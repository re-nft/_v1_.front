import React, { useCallback, useState, useContext, useEffect } from "react";
import {
  CurrentAddressContext,
  RentNftContext,
  SignerContext,
  ResolverContext,
  // todo: remove for prod
  MyERC20Context,
} from "../../../hardhat/SymfoniContext";
import NumericField from "../../../components/numeric-field";
import { PaymentToken } from "../../../types";
import CatalogueItem from "../../../components/catalogue-item";
import ItemWrapper from "../../../components/items-wrapper";
import BatchRentModal from "../../../modals/batch-rent";
import ActionButton from "../../../components/action-button";
import startRent from "../../../services/start-rent";
import CatalogueLoader from "../../../components/catalogue-loader";
import GraphContext from "../../../contexts/graph";
import { Lending } from "../../../contexts/graph/classes";
import BatchBar from "../../../components/batch-bar";
import { BatchContext } from "../../../controller/batch-controller";
import Pagination from "../../../components/pagination";
import { PageContext } from "../../../controller/page-controller";
import createCancellablePromise from "../../../contexts/create-cancellable-promise";

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
  const { instance: renft } = useContext(RentNftContext);
  const [signer] = useContext(SignerContext);
  const { instance: resolver } = useContext(ResolverContext);
  const { instance: myERC20 } = useContext(MyERC20Context);
  const { getUsersLending } = useContext(GraphContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleBatchModalClose = useCallback(() => {
    setOpenBatchModel(false);
    onReset();
    handleRefresh();
  }, [onReset, setOpenBatchModel]);

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
        !myERC20
      )
        return;

      const pmtToken = PaymentToken.DAI;
      await startRent(
        renft,
        nft,
        resolver,
        currentAddress,
        signer,
        rentDuration,
        pmtToken
      );
    },
    [renft, currentAddress, signer, resolver, myERC20]
  );

  const handleRefresh = () => {
    setIsLoading(true);
    getUsersLending().then((items: Lending[] | undefined) => {
      onChangePage(items || []);
      onSetItems(items || []);
      setIsLoading(false);
    });
  };

  const handleBatchRent = useCallback(() => {
    setOpenBatchModel(true);
  }, [setOpenBatchModel]);

  useEffect(() => {
    setIsLoading(true);

    const getUsersLendingRequest = createCancellablePromise(getUsersLending());

    getUsersLendingRequest.promise.then(
      (usersLnding: Lending[] | undefined) => {
        onChangePage(usersLnding || []);
        onSetItems(usersLnding || []);
        setIsLoading(false);
      }
    );

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

  return (
    <>
      <BatchRentModal
        nft={(checkedItems as any) as Lending[]}
        open={isOpenBatchModel}
        onSubmit={handleRent}
        handleClose={handleBatchModalClose}
      />
      <ItemWrapper>
        {((currentPage as any) as Lending[]).map((nft: Lending) => (
          <CatalogueItem
            key={`${nft.address}::${nft.tokenId}::${nft.lending.id}`}
            nft={nft}
            checked={checkedMap[nft.tokenId] || false}
            onCheckboxChange={onCheckboxChange}
          >
            <NumericField
              text="Daily price"
              value={String(nft.lending.dailyRentPrice)}
              unit={PaymentToken[nft.lending.paymentToken]}
            />
            <NumericField
              text="Max duration"
              value={String(nft.lending.maxRentDuration)}
              unit="days"
            />
            <NumericField
              text="Collateral"
              value={String(nft.lending.nftPrice)}
              unit={PaymentToken[nft.lending.paymentToken]}
            />
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
          title={`Batch process ${countOfCheckedItems} items`}
          actionTitle="Rents All"
          onCancel={onReset}
          onClick={handleBatchRent}
        />
      )}
    </>
  );
};

export default React.memo(AvailableToRent);
