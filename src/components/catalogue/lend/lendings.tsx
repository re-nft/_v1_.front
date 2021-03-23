import React, { useState, useCallback, useContext, useEffect } from "react";
import GraphContext from "../../../contexts/graph";
import { Nft } from "../../../contexts/graph/classes";
import BatchLendModal from "../modals/batch-lend";
import CatalogueItem from "../components/catalogue-item";
import ActionButton from "../components/action-button";
import CatalogueLoader from "../components/catalogue-loader";
import BatchBar from '../components/batch-bar';
import {BatchContext} from '../../controller/batch-controller';
import createCancellablePromise from '../../../contexts/create-cancellable-promise';

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
  const { getUserNfts } = useContext(GraphContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nftItems, setNftItems] = useState<Nft[]>([]);
  
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
    setIsLoading(true);    
    
    const getUserNftsRequest = createCancellablePromise(getUserNfts());

    getUserNftsRequest.promise.then((items: Nft[] | undefined) => {
      if (items) {
        setNftItems(items);
        onSetItems(items);
        setIsLoading(false);
      } else {
        onSetItems([]);
        setNftItems([]);
        setIsLoading(false);
      }
    });
  
    return getUserNftsRequest.cancel;
  }, []);

  if (isLoading) {
    return <CatalogueLoader />;
  }

  if (!isLoading && nftItems.length === 0) {
    return (
      <div className="center">
        You dont have any NFTs
      </div>
    );
  }
  
  return (
    <>
      {modalOpen && <BatchLendModal nfts={checkedItems} open={modalOpen} onClose={handleClose} />}
      {nftItems.map((nft) => (
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

export default React.memo(Lendings);
