import React, { useState, useCallback, useContext, useEffect } from "react";
import GraphContext from "../../../contexts/graph";
import { Nft } from "../../../contexts/graph/classes";
import BatchLendModal from "../modals/batch-lend";
import CatalogueItem from "../../catalogue/catalogue-item";
import ActionButton from "../../forms/action-button";
import CatalogueLoader from "../catalogue-loader";
import BatchBar from '../batch-bar';
import {BatchContext} from '../../controller/batch-controller';

const Lendings: React.FC = () => {
  const { 
    checkedItems, 
    checkedMap, 
    countOfCheckedItems, 
    onReset, 
    onCheckboxChange, 
    onSetCheckedItem, 
    onSetItems 
  } = useContext(BatchContext);
  const [modalOpen, setModalOpen] = useState(false);
  const { usersNfts } = useContext(GraphContext);
  
  const handleClose = useCallback(() => {
    setModalOpen(false);
    onReset();
  }, [setModalOpen]);
  
  const handleStartLend = useCallback(async (nft: Nft) => {
      onSetCheckedItem(nft);
      setModalOpen(true);
    },
    [setModalOpen]
  );

  const handleBatchModalOpen = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  useEffect(() => {
    onSetItems(usersNfts);
    return () => {
      console.log('Lendings:onReset');
      return onReset();
    };
  }, []);

  if (usersNfts.length === 0) {
    return <CatalogueLoader />;
  }
  console.log('Lendings ', checkedMap, checkedItems);
  return (
    <>
      {modalOpen && <BatchLendModal nfts={checkedItems} open={modalOpen} onClose={handleClose} />}
      {usersNfts.map((nft) => (
          <CatalogueItem 
            key={`${nft.address}::${nft.tokenId}`} 
            nft={nft}
            checked={checkedMap[nft.tokenId] || false}
            onCheckboxChange={onCheckboxChange}
          >
            <ActionButton<Nft>
              nft={nft}
              title="Lend now"
              onClick={handleStartLend}
            />
          </CatalogueItem>
        ))}
      {countOfCheckedItems > 1 && (
        <BatchBar 
          title={`Batch lend ${countOfCheckedItems} items`} 
          actionTitle="Lend all" 
          onCancel={onReset} 
          onClick={handleBatchModalOpen} 
        />
      )}
    </>
  );
};

export default Lendings;
