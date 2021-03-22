import React, { useCallback, useState, useContext, useMemo, useEffect } from "react";
import {
  CurrentAddressContext,
  RentNftContext,
  SignerContext,
  ResolverContext,
  // todo: remove for prod
  MyERC20Context,
} from "../../../hardhat/SymfoniContext";
import NumericField from "../../forms/numeric-field";
import { PaymentToken } from "../../../types";
import CatalogueItem from "../../catalogue/catalogue-item";
import BatchRentModal from "../modals/batch-rent";
import ActionButton from "../../forms/action-button";
import startRent from "../../../services/start-rent";
import CatalogueLoader from "../catalogue-loader";
import GraphContext from "../../../contexts/graph";
import { Lending } from "../../../contexts/graph/classes";
import BatchBar from '../batch-bar';
import {BatchContext} from '../../controller/batch-controller';
import createCancellablePromise from '../../../contexts/create-cancellable-promise';

const AvailableToRent: React.FC = () => {
  const { 
    checkedItems, 
    checkedMap, 
    countOfCheckedItems, 
    onReset, 
    onCheckboxChange, 
    onSetCheckedItem, 
    onSetItems 
  } = useContext(BatchContext);
  const [isOpenBatchModel, setOpenBatchModel] = useState(false);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);
  const [signer] = useContext(SignerContext);
  const { instance: resolver } = useContext(ResolverContext);
  const { instance: myERC20 } = useContext(MyERC20Context);

  const { getUsersLending } = useContext(GraphContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nftItems, setNftItems] = useState<Lending[]>([]);

  const handleBatchModalClose = useCallback(() => {
    setOpenBatchModel(false);
    onReset();
  }, []);

  const handleBatchModalOpen = useCallback((nft: Lending) => {
    // @ts-ignore
    onSetCheckedItem(nft);
    setOpenBatchModel(true);
  }, []);

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

  const handleBatchRent = useCallback(() => {
    setOpenBatchModel(true);
  }, [setOpenBatchModel]);

  useEffect(() => {
    setIsLoading(true);

    const getUsersLendingRequest = createCancellablePromise(getUsersLending());

    getUsersLendingRequest.promise.then((usersLnding: Lending[] | undefined) => {
      if (usersLnding) {
        onSetItems(usersLnding);
        setNftItems(usersLnding);
        setIsLoading(false);
      } else {
        onSetItems([]);
        setNftItems([]);
        setIsLoading(false);
      }
    });
    
    return getUsersLendingRequest.cancel;
  }, []);

  if (isLoading) {
    return <CatalogueLoader />;
  }

  if (!isLoading && nftItems.length === 0) {
    return (
      <div className="center">
        You dont have any lend anything yet
      </div>
    )
  }

  return (
    <>
      <BatchRentModal
        nft={checkedItems as any as Lending[]}
        open={isOpenBatchModel}
        onSubmit={handleRent}
        handleClose={handleBatchModalClose}
      />
      {nftItems.map((nft: Lending) => (
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
      {countOfCheckedItems > 1 && (
        <BatchBar 
          title={`Batch ${countOfCheckedItems} rents`} 
          actionTitle="Rents All" 
          onCancel={onReset} 
          onClick={handleBatchRent} 
        />
      )}
    </>
  );
};

export default React.memo(AvailableToRent);
