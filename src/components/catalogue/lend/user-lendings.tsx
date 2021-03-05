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

const UserLendings: React.FC = () => {
  const { usersLending } = useContext(GraphContext);
  const [checkedItems, setCheckedItems] = useState<Nft[]>([]);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const { instance: renft } = useContext(RentNftContext);
  const { setHash } = useContext(TransactionStateContext);
  const allUsersLendings = useMemo(() => {
    return usersLending.filter(Boolean);
  }, [usersLending]);

  const handleStopLend = useCallback(async (nft: Nft[]) => {
      if (!renft) return;     
      // todo: another point: if someone is renting we also need
      // to show the button: "Claim Collateral" in place of Stop Lending
      // This button will be active ONLY if the renter exceeded their
      // rent duration (that they choose in the modal in the Rent tab)
      const tx = await stopLend(renft, nft);
      await setHash(tx.hash);
    },
    [renft, setHash, checkedItems]
  );

  const handleClickNft = useCallback(async (nft: Nft) => {
    handleStopLend([nft]);
  }, [setCheckedItems]);

  const handleBatchStopnLend = useCallback(async () => {
    handleStopLend(checkedItems);
  }, [handleStopLend]);

  const handleCheckboxChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const target = evt.target.name;
      const checked = evt.target.checked;
      const sources: Nft[] = checkedItems.slice(0);
      const item = allUsersLendings.find((nft) => nft.tokenId === target);
      const sourceIndex = checkedItems.findIndex(
        (nft) => nft.tokenId === target
      );
      setCheckedMap({
        ...checkedMap,
        [target]: checked,
      })
      if (sourceIndex === -1 && item) {
        sources.push(item);
        setCheckedItems(sources);
      } else {
        sources.splice(sourceIndex, 1);
        setCheckedItems(sources);
      }
    },
    [checkedItems, setCheckedItems, allUsersLendings, setCheckedMap, checkedMap]
  );

  const resetCheckBoxState = useCallback(() => {
    setCheckedMap({});
  }, [setCheckedMap]);

  useEffect(() => {
    if (checkedItems.length === 0) {
      resetCheckBoxState();
    }
  }, [checkedItems]);

  if (allUsersLendings.length === 0) {
    return <CatalogueLoader />;
  }

  const countOfCheckedItems = checkedItems.length;

  return (
    <>
      {allUsersLendings.map((nft) => (
        <CatalogueItem 
          key={`${nft.address}::${nft.tokenId}`}
          checked={checkedMap[nft.tokenId] || false}
          nft={nft}
          onCheckboxChange={handleCheckboxChange}
        >
          <ActionButton
            nft={nft}
            title="Stop Lending"
            onClick={handleClickNft}
          />
        </CatalogueItem>
      ))}
      {countOfCheckedItems > 1 && (
        <BatchBar title={`Stop Batch ${countOfCheckedItems} Lends`} actionTitle="Stop Lending" onClick={handleBatchStopnLend} />
      )}
    </>
  );
};

export default UserLendings;
