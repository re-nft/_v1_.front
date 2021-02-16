import React, { useContext, useMemo, useCallback } from "react";
import { Box } from "@material-ui/core";
import * as R from "ramda";

import {
  CurrentAddressContext,
  RentNftContext,
} from "../../hardhat/SymfoniContext";
import GraphContext from "../../contexts/Graph";
import { Nft } from "../../types";
import { TransactionStateContext } from "../../contexts/TransactionState";

type StopLendButtonProps = {
  nft: Nft & { lendingId: string };
};

// todo: handleStopLend multiple as well
const StopLendButton: React.FC<StopLendButtonProps> = ({ nft }) => {
  const { instance: renft } = useContext(RentNftContext);
  const { setHash } = useContext(TransactionStateContext);

  const handleStopLend = useCallback(async () => {
    if (!renft || !nft.contract) return;
    console.log("nft.contract.address", nft.contract.address);
    console.log("nft.tokenId", nft.tokenId);
    console.log("nft.lending", nft.lendingId);
    const tx = await renft.stopLending(
      [nft.contract.address],
      [nft.tokenId],
      [nft.lendingId]
    );
    await setHash(tx.hash);
  }, [nft, renft, setHash]);

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
  const [currentAddress] = useContext(CurrentAddressContext);
  const { lendings } = useContext(GraphContext);
  // todo: this is not DRY, same code in AvailableToLend
  const myNfts = useMemo(() => {
    const nfts: (Nft & { lendingId: string })[] = [];
    if (!lendings || !currentAddress) return nfts;
    for (const address of Object.keys(lendings)) {
      if (!lendings[address]) continue;
      if (!R.hasPath([address, "tokenIds"], lendings)) continue;
      for (const tokenId of Object.keys(lendings[address].tokenIds)) {
        let image = R.pathOr(
          "",
          [address, "tokenIds", tokenId, "image"],
          lendings
        );
        if (image === "") {
          image = R.pathOr(
            "",
            [address, "tokenIds", tokenId, "image_url"],
            lendings
          );
        }
        if (
          lendings[address].tokenIds[tokenId].lenderAddress !== currentAddress
        )
          continue;
        nfts.push({
          contract: lendings[address].contract,
          tokenId,
          image,
          lendingId: lendings[address].tokenIds[tokenId].id,
        });
      }
    }
    return nfts;
  }, [lendings, currentAddress]);

  return (
    <Box>
      <Box className="Catalogue">
        {myNfts.map((nft) => {
          const nftId = `${nft.contract?.address ?? ""}::${nft.tokenId}`;
          return <CatalogueItem key={nftId} nftId={nftId} nft={nft} />;
        })}
      </Box>
    </Box>
  );
};

export default AllMyLending;
