import React, { useContext, useCallback } from "react";
import { RentNftContext } from "../../../hardhat/SymfoniContext";
import GraphContext from "../../../contexts/graph";
import { Nft } from "../../../contexts/graph/classes";
import { TransactionStateContext } from "../../../contexts/TransactionState";
import CatalogueItem from "../../catalogue/catalogue-item";
import ActionButton from "../../forms/action-button";
import stopLend from '../../../services/stop-lending';
import CatalogueLoader from '../catalogue-loader';

const UserLendings: React.FC = () => {
  const { usersLending } = useContext(GraphContext);
  const { instance: renft } = useContext(RentNftContext);
  const { setHash } = useContext(TransactionStateContext);

  const handleStopLend = useCallback(async (nft: Nft) => {
    if (!renft) return;

    // todo: another point: if someone is renting we also need
    // to show the button: "Claim Collateral" in place of Stop Lending
    // This button will be active ONLY if the renter exceeded their
    // rent duration (that they choose in the modal in the Rent tab)
    const tx = await stopLend(renft, nft, "100");
    await setHash(tx.hash);
  }, [renft, setHash]);

  if (usersLending.length === 0) {
    return <CatalogueLoader/>
  }

  return (
    <>
      {usersLending.map(async (nft) => {
        const mediaURI = await nft.mediaURI();
        return (
          <CatalogueItem
            key={`${nft.address}::${nft.tokenId}`}
            tokenId={nft.tokenId}
            nftAddress={nft.address}
            mediaURI={mediaURI}
          >
            <ActionButton
              nft={nft}
              title="Stop Lending"
              onClick={handleStopLend}
            />
          </CatalogueItem>
        );
      })}
    </>
  );
};

export default UserLendings;
