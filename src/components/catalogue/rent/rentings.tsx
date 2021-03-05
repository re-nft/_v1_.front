import React, { useCallback, useState, useContext, useMemo, useEffect } from "react";
import {
  CurrentAddressContext,
  RentNftContext,
  SignerContext,
  ResolverContext,
  // todo: remove for prod
  MyERC20Context,
} from "../../../hardhat/SymfoniContext";
import { Lending } from "../../../contexts/graph/classes";
import NumericField from "../../forms/numeric-field";
import { PaymentToken } from "../../../types";
import CatalogueItem from "../../catalogue/catalogue-item";
import BatchRentModal from "../modals/batch-rent";
import ActionButton from "../../forms/action-button";
import startRent from "../../../services/start-rent";
import CatalogueLoader from "../catalogue-loader";
import GraphContext from "../../../contexts/graph";
import BatchBar from '../batch-bar';

export const AvailableToRent: React.FC = () => {
  const [isOpenBatchModel, setOpenBatchModel] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Lending[]>([]);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);
  const [signer] = useContext(SignerContext);
  const { instance: resolver } = useContext(ResolverContext);
  const { instance: myERC20 } = useContext(MyERC20Context);
  const { renftsLending } = useContext(GraphContext);

  const allRentings = useMemo(() => {
    return Object.values(renftsLending);
  }, [renftsLending]);

  const handleBatchModalClose = useCallback(() => {
    setOpenBatchModel(false);
    setCheckedItems([]);
    resetCheckBoxState();
  }, []);

  const handleBatchModalOpen = useCallback((nft: Lending) => {
    setCheckedItems([nft]);
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

  const handleCheckboxChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const target = evt.target.name;
      const checked = evt.target.checked;
      const sources: Lending[] = checkedItems.slice(0);
      const item = allRentings.find((nft) => nft.tokenId === target);
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
    [checkedItems, setCheckedItems, allRentings, setCheckedMap, checkedMap]
  );

  const resetCheckBoxState = useCallback(() => {
    setCheckedMap({});
  }, [setCheckedMap]);

  useEffect(() => {
    if (checkedItems.length === 0) {
      resetCheckBoxState();
    }
  }, [checkedItems]);

  const countOfCheckedItems = checkedItems.length;

  if (allRentings.length === 0) {
    return <CatalogueLoader />;
  }

  return (
    <>
      <BatchRentModal
        nft={checkedItems}
        open={isOpenBatchModel}
        onSubmit={handleRent}
        handleClose={handleBatchModalClose}
      />
      {allRentings.map((nft: Lending) => (
        <CatalogueItem
          key={`${nft.address}::${nft.tokenId}::${nft.lending.id}`}
          nft={nft}
          checked={checkedMap[nft.tokenId] || false}
          onCheckboxChange={handleCheckboxChange}
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
          <ActionButton
            // TODO
            //@ts-ignore
            onClick={handleBatchModalOpen}
            nft={nft}
            title="Rent Now"
          />
        </CatalogueItem>
      ))}
      {countOfCheckedItems > 1 && <BatchBar title={`Batch ${countOfCheckedItems} rents`} actionTitle="Rents All" onClick={handleBatchRent} />}
    </>
  );
};

export default AvailableToRent;
