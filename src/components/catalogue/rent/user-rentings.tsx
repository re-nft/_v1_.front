import React, { useCallback, useState, useEffect, useContext, useMemo } from "react";
import { Lending, Nft, Renting } from "../../../contexts/graph/classes";
import { PaymentToken } from "../../../types";
import NumericField from "../../forms/numeric-field";
import CatalogueItem from "../../catalogue/catalogue-item";
import ReturnModal from "../modals/return";
import ActionButton from "../../forms/action-button";
import CatalogueLoader from "../catalogue-loader";
import BatchBar from '../batch-bar';
import {BatchContext} from '../../controller/batch-controller';
import GraphContext from "../../../contexts/graph";

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
  const { renftsRenting } = useContext(GraphContext);
  const [modalOpen, setModalOpen] = useState(false);
  const allRentings = useMemo(() => {
    return Object.values(renftsRenting);
  }, [renftsRenting]);
  const handleCloseModal = useCallback(() => setModalOpen(false), [setModalOpen]);
  const handleBatchStopRent = useCallback(() => setModalOpen(true), [setModalOpen]);
  const handleOpenModal = useCallback(
    async (nft: Renting) => {
      onSetCheckedItem(nft);
      setModalOpen(true);
    },
    [setModalOpen]
  );

  useEffect(() => {
    onSetItems(allRentings);
    return () => {
      return onReset();
    };
  }, []);

  if (allRentings.length === 0) {
    return <CatalogueLoader />;
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
      {allRentings.map((nft: Renting) => {
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
            <ActionButton<Renting>
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

export default UserRentings;
