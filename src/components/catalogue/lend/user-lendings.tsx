import React, { useContext, useCallback, useState, useEffect } from "react";
import { BigNumber } from "ethers";
import { RentNftContext } from "../../../hardhat/SymfoniContext";
import GraphContext from "../../../contexts/graph";
import { Nft } from "../../../contexts/graph/classes";
import { TransactionStateContext } from "../../../contexts/TransactionState";
import CatalogueItem from "../../catalogue/catalogue-item";

type StopLendButtonProps = {
  nft: Nft;
};

// todo: handleStopLend batch as well
const StopLendButton: React.FC<StopLendButtonProps> = ({ nft }) => {
  const { instance: renft } = useContext(RentNftContext);
  const { setHash } = useContext(TransactionStateContext);

  const handleStopLend = useCallback(async () => {
    if (!renft) return;

    // todo: another point: if someone is renting we also need
    // to show the button: "Claim Collateral" in place of Stop Lending
    // This button will be active ONLY if the renter exceeded their
    // rent duration (that they choose in the modal in the Rent tab)
    const tx = await renft.stopLending(
      [nft.address],
      [nft.tokenId],
      [BigNumber.from("100")]
    );

    await setHash(tx.hash);
  }, [nft, renft, setHash]);

  return (
    <div className="Nft__card" onClick={handleStopLend}>
      <span className="Nft__button">Stop Lending</span>
    </div>
  );
};

const UserLendings: React.FC = () => {
  const { usersLending } = useContext(GraphContext);

  return (
    <>
      {usersLending.map(async (nft) => {
        const mediaURI = await nft.mediaURI();
        const nftId = `${nft.address}::${nft.tokenId}`;
        return (
          <CatalogueItem
            key={nftId}
            tokenId={nft.tokenId}
            nftAddress={nft.address}
            mediaURI={mediaURI}
          >
            <div className="Nft__card" style={{ marginTop: "8px" }}>
              <StopLendButton nft={nft} />
            </div>
          </CatalogueItem>
        );
      })}
    </>
  );
};

export default UserLendings;
