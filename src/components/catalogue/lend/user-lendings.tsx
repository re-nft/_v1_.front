import React, { useContext, useCallback, useState, useMemo, useEffect } from "react";
import { RentNftContext } from "../../../hardhat/SymfoniContext";
import GraphContext from "../../../contexts/graph";
import { Nft } from "../../../contexts/graph/classes";
import { TransactionStateContext } from "../../../contexts/TransactionState";
import CatalogueItem from "../../catalogue/catalogue-item";
import ActionButton from "../../forms/action-button";
import stopLend from "../../../services/stop-lending";
import CatalogueLoader from "../catalogue-loader";
import BatchBar from '../batch-bar';
import {BatchContext} from '../../controller/batch-controller';

const UserLendings: React.FC = () => {
  const { 
    checkedItems, 
    checkedMap, 
    countOfCheckedItems, 
    onReset, 
    onCheckboxChange, 
    onSetItems 
  } = useContext(BatchContext);
  const { usersLending } = useContext(GraphContext);
  const { instance: renft } = useContext(RentNftContext);
  const { setHash } = useContext(TransactionStateContext);
  const allUsersLendings = useMemo(() => {
    return usersLending.filter(Boolean);
  }, [usersLending]);

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
    onSetItems(allUsersLendings);
    return () => {
      return onReset();
    };
  }, []);

  if (allUsersLendings.length === 0) {
    return <CatalogueLoader />;
  }

  return (
    <>
      {allUsersLendings.map((nft) => (
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

export default UserLendings;
