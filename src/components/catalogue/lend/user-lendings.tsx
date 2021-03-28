import React, { useContext, useCallback, useState, useEffect } from "react";
import { RentNftContext } from "../../../hardhat/SymfoniContext";
import GraphContext from "../../../contexts/graph";
import { Lending, Nft } from "../../../contexts/graph/classes";
import { TransactionStateContext } from "../../../contexts/TransactionState";
import CatalogueItem from "../components/catalogue-item";
import ActionButton from "../components/action-button";
import stopLend from "../../../services/stop-lending";
import CatalogueLoader from "../components/catalogue-loader";
import BatchBar from '../components/batch-bar';
import {BatchContext} from '../../controller/batch-controller';
import createCancellablePromise from '../../../contexts/create-cancellable-promise';

const UserLendings: React.FC = () => {
  const { 
    checkedItems, 
    checkedMap, 
    countOfCheckedItems, 
    onReset, 
    onCheckboxChange, 
    onSetItems 
  } = useContext(BatchContext);
  const { getUserLending } = useContext(GraphContext);
  const { instance: renft } = useContext(RentNftContext);
  const { setHash } = useContext(TransactionStateContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nftItems, setNftItems] = useState<Nft[]>([]);

  const handleStopLend = useCallback(async (nfts: Nft[]) => {
      if (!renft) return;     
      const tx = await stopLend(renft, nfts);
      await setHash(tx.hash);
      onReset();
    },
    [renft, setHash]
  );

  const handleClickNft = useCallback(async (nft: Nft) => {
    handleStopLend([nft]);
  }, []);

  const handleBatchStopnLend = useCallback(async () => {
    handleStopLend(checkedItems);
  }, [handleStopLend, checkedItems]);

  useEffect(() => {
    setIsLoading(true);

    const getUserLendingRequest = createCancellablePromise(getUserLending());

    getUserLendingRequest.promise.then((userLnding: Lending[] | undefined) => {
      if (userLnding) {
        onSetItems(userLnding);
        setNftItems(userLnding);
        setIsLoading(false);
      } else {
        onSetItems([]);
        setNftItems([]);
        setIsLoading(false);
      }
    });
    
    return getUserLendingRequest.cancel;
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
      {nftItems.map((nft) => (
        <CatalogueItem 
          key={`${nft.address}::${nft.tokenId}`}
          checked={checkedMap[nft.tokenId] || false}
          nft={nft}
          onCheckboxChange={onCheckboxChange}
        >
          <ActionButton<Nft>
            nft={nft}
            title="Stop Lending"
            onClick={handleClickNft}
          />
        </CatalogueItem>
      ))}
      {countOfCheckedItems > 1 && (
        <BatchBar 
          title={`Stop Batch ${countOfCheckedItems} Lends`} 
          actionTitle="Stop Lending" 
          onClick={handleBatchStopnLend} 
          onCancel={onReset}
        />
      )}
    </>
  );
};

export default React.memo(UserLendings);
