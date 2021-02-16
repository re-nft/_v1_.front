import React, { useState, useContext, useMemo } from "react";
import { Box } from "@material-ui/core";
import * as R from "ramda";

import { CurrentAddressContext } from "../../hardhat/SymfoniContext";
import GraphContext from "../../contexts/Graph";
import { LendModal } from "../LendModal";
import { Nft } from "../../types";
import { Lending } from "../../types/graph";

type StopLendButtonProps = {
  handleStopLend: (nft: Lending) => void;
  lending: Lending;
};

const DEFAULT_NFT: Nft = {
  tokenId: "",
  image: "",
};

const StopLendButton: React.FC = () => {
  // const _handleStopLend = useCallback(async () => {
  //   await handleStopLend(lending);
  // }, [lending, handleStopLend]);

  return (
    <div className="Product__details">
      <span className="Product__buy">Stop Lending</span>
    </div>
  );
};

type CatalogueItemProps = {
  nftId: string;
  nft: Nft;
};

// todo: this is not DRY, same code in AvailableToLend
const CatalogueItem: React.FC<CatalogueItemProps> = ({ nftId, nft }) => {
  return (
    <div className="Catalogue__item" key={nftId}>
      <div className="Product" data-item-id={nftId} data-item-image={nft.image}>
        <div className="Product__image">
          <a href={nft.image} target="_blank" rel="noreferrer">
            <img alt="nft" src={nft.image} />
          </a>
        </div>
        <div className="Product__details">
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
        <div className="Product__details">
          <p className="Product__text_overflow">
            <span className="Product__label">Token id</span>
            <span className="Product__value">{nft.tokenId}</span>
          </p>
        </div>
        <div className="Product__details" style={{ marginTop: "8px" }}>
          <StopLendButton />
        </div>
      </div>
    </div>
  );
};

export const AllMyLending: React.FC = () => {
  const [currentAddress] = useContext(CurrentAddressContext);
  const [selectedNft, setSelectedNft] = useState<Nft & { isApproved: boolean }>(
    { ...DEFAULT_NFT, isApproved: true }
  );
  const [modalOpen, setModalOpen] = useState(false);
  // all of the erc721s and erc1155s that I own, all the lendings on the platform
  // todo: need to filter these by my address as the lender, because these are in fact all the NFTs
  const { lendings } = useContext(GraphContext);
  // todo: this is not DRY, same code in AvailableToLend
  const myNfts = useMemo(() => {
    const nfts: Nft[] = [];
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
        });
      }
    }
    return nfts;
  }, [lendings, currentAddress]);

  return (
    <Box>
      <LendModal nft={selectedNft} open={modalOpen} setOpen={setModalOpen} />
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
