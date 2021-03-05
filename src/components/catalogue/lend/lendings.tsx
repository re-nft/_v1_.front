import React, { useState, useCallback, useContext, useEffect } from "react";
import GraphContext from "../../../contexts/graph";
import { Nft } from "../../../contexts/graph/classes";
import BatchLendModal from "../modals/batch-lend";
import CatalogueItem from "../../catalogue/catalogue-item";
import ActionButton from "../../forms/action-button";
import CatalogueLoader from "../catalogue-loader";
import BatchBar from '../batch-bar';

const Lendings: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Nft[]>([]);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const { usersNfts } = useContext(GraphContext);
  const handleClose = useCallback(() => {
    setCheckedItems([]);
    setModalOpen(false);
  }, [setModalOpen, setCheckedItems]);
  const handleStartLend = useCallback(async (nft) => {
      setCheckedItems([nft]);
      setModalOpen(true);
    },
    [setCheckedItems, setModalOpen]
  );

  const handleBatchModalOpen = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  const handleCheckboxChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const target = evt.target.name;
      const checked = evt.target.checked;
      const sources: Nft[] = checkedItems.slice(0);
      const item = usersNfts.find((nft) => nft.tokenId === target);
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
    [checkedItems, setCheckedItems, usersNfts, setCheckedMap, checkedMap]
  );

  const resetCheckBoxState = useCallback(() => {
    setCheckedMap({});
  }, [setCheckedMap]);

  useEffect(() => {
    if (checkedItems.length === 0) {
      resetCheckBoxState();
    }
  }, [checkedItems]);

  if (usersNfts.length === 0) {
    return <CatalogueLoader />;
  }

  const countOfCheckedItems = checkedItems.length;
  return (
    <>
      {modalOpen && <BatchLendModal nfts={checkedItems} open={modalOpen} onClose={handleClose} />}
      {usersNfts.map((nft) => (
          <CatalogueItem 
            key={`${nft.address}::${nft.tokenId}`} 
            nft={nft}
            checked={checkedMap[nft.tokenId] || false}
            onCheckboxChange={handleCheckboxChange}
          >
            <ActionButton
              nft={nft}
              title="Lend now"
              onClick={handleStartLend}
            />
          </CatalogueItem>
        ))}
      {countOfCheckedItems > 1 && (
        <BatchBar title={`Batch lend ${countOfCheckedItems} items`} actionTitle="Lend all" onClick={handleBatchModalOpen} />
      )}
    </>
  );
};

export default Lendings;
