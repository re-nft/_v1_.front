import React, { useContext, useCallback } from "react";
import { Box } from "@material-ui/core";

import { RentNftContext } from "../../hardhat/SymfoniContext";
import GraphContext from "../../contexts/Graph";
import { Nft } from "../../types";
import { TransactionStateContext } from "../../contexts/TransactionState";
import { useRenft } from "../../hooks/useRenft";

// todo: this type is also defined in useRenft hook
type StopLendButtonProps = {
  nft: Nft & { lendingId: string };
};

// todo: handleStopLend multiple as well
const StopLendButton: React.FC<StopLendButtonProps> = ({ nft }) => {
  const { instance: renft } = useContext(RentNftContext);
  const { setHash } = useContext(TransactionStateContext);
  const { removeLending } = useContext(GraphContext);

  const handleStopLend = useCallback(async () => {
    if (!renft || !nft.contract) return;
    const tx = await renft.stopLending(
      [nft.contract.address],
      [nft.tokenId],
      [nft.lendingId]
    );
    const isSuccess = await setHash(tx.hash);
    if (isSuccess) {
      removeLending([nft]);
    }
  }, [nft, renft, setHash, removeLending]);

  return (
    <div className="Nft__card" onClick={handleStopLend}>
      <span className="Nft__button">Stop Lending</span>
    </div>
  );
};

type CatalogueItemProps = {
  nftId: string;
  nft: Nft & { lendingId: string };
};

// todo: this is not DRY, same code in AvailableToLend
const CatalogueItem: React.FC<CatalogueItemProps> = ({ nftId, nft }) => {
  return (
    <div className="Catalogue__item" key={nftId}>
      <div className="Product" data-item-id={nftId} data-item-image={nft.image}>
        <div className="Nft__image">
          <a href={nft.image} target="_blank" rel="noreferrer">
            <img alt="nft" src={nft.image} />
          </a>
        </div>
        <div className="Nft__card">
          <p className="Product__text_overflow">
            <a
              href={`https://etherscan.io/address/${
                nft.contract?.address ?? ""
              }`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none", color: "black" }}
            >
              {nft.contract?.address ?? ""}
            </a>
          </p>
        </div>
        <div className="Nft__card">
          <p className="Product__text_overflow">
            <span className="Product__label">Token id</span>
            <span className="Product__value">{nft.tokenId}</span>
          </p>
        </div>
        <div className="Nft__card" style={{ marginTop: "8px" }}>
          <StopLendButton nft={nft} />
        </div>
      </div>
    </div>
  );
};

export const AllMyLending: React.FC = () => {
  const { myLendings } = useRenft();
  return (
    <Box>
      <Box className="Catalogue">
        {myLendings.map((nft) => {
          const nftId = `${nft.contract?.address ?? ""}::${nft.tokenId}`;
          return <CatalogueItem key={nftId} nftId={nftId} nft={nft} />;
        })}
      </Box>
    </Box>
  );
};

export default AllMyLending;
