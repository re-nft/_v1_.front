import React, { useCallback, useState, useEffect, useContext, useMemo } from "react";
import { Renting } from "../../../contexts/graph/classes";
import { PaymentToken } from "../../../types";
import NumericField from "../../forms/numeric-field";
import CatalogueItem from "../../catalogue/catalogue-item";
import ReturnModal from "../modals/return";
import ActionButton from "../../forms/action-button";
import CatalogueLoader from "../catalogue-loader";
import BatchBar from '../batch-bar';
import {BatchContext} from '../../controller/batch-controller';
import GraphContext from "../../../contexts/graph";
import { Nft } from "../../../contexts/graph/classes";
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
  const { getUserRenting } = useContext(GraphContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nftItems, setNftItems] = useState<Nft[]>([]);
  
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
      if (userRenting) {
        onSetItems(userRenting);
        setNftItems(userRenting);
        setIsLoading(false);
      } else {
        onSetItems([]);
        setNftItems([]);
        setIsLoading(false);
      }
    });

    return getUserRentingRequest.cancel;
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
      {modalOpen && (
        <ReturnModal
          open={modalOpen}
          nfts={checkedItems as any as Renting[]}
          onClose={handleCloseModal}
        />
      )}
      {nftItems.map((nft: Nft) => {
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
