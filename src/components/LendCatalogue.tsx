import React, { useState, useCallback, useContext, useMemo } from "react";
import { Box } from "@material-ui/core";
import * as R from "ramda";

import GraphContext from "../contexts/Graph";
import { LendModal } from "./LendModal";
import { Nft, Lending } from "../types";
import { ERC721 } from "../hardhat/typechain/ERC721";
import {
  CurrentAddressContext,
  RentNftContext,
} from "../hardhat/SymfoniContext";

type LendButtonProps = {
  handleLend: (nft: Nft) => void;
  nft: Nft;
};

type StopLendButtonProps = {
  handleStopLend: (nft: Lending) => void;
  lending: Lending;
};

// todo: maybe worth supplying both: all and the ones that I lend at the same time
type LendCatalogueProps = {
  nfts: Nft[];
  iLend: boolean;
};

const DEFAULT_NFT: Nft = {
  tokenId: "",
  image: "",
};

const LendButton: React.FC<LendButtonProps> = ({ handleLend, nft }) => {
  const handleClick = useCallback(() => {
    handleLend(nft);
  }, [handleLend, nft]);
  return (
    <div className="Product__details">
      <span className="Product__buy" onClick={handleClick}>
        Lend now
      </span>
    </div>
  );
};

const StopLendButton: React.FC<StopLendButtonProps> = ({
  lending,
  handleStopLend,
}) => {
  const _handleStopLend = useCallback(async () => {
    await handleStopLend(lending);
  }, [lending, handleStopLend]);

  return (
    <div className="Product__details">
      <span className="Product__buy" onClick={_handleStopLend}>
        Stop Lending
      </span>
    </div>
  );
};

type CatalogueItemProps = {
  nftId: string;
  nft: Nft;
  handleStartLend: (nft: Nft) => void;
};

const CatalogueItem: React.FC<CatalogueItemProps> = ({
  nftId,
  nft,
  handleStartLend,
}) => {
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
          <LendButton nft={nft} handleLend={handleStartLend} />
          {/* {isLending(nft) ? (
            <StopLendButton lending={nft} handleStopLend={handleStopLend} />
          ) : (
            <LendButton nft={nft} handleLend={handleLend} />
          )} */}
        </div>
      </div>
    </div>
  );
};

const LendCatalogue: React.FC<LendCatalogueProps> = () => {
  const [selectedNft, setSelectedNft] = useState<Nft & { isApproved: boolean }>(
    { ...DEFAULT_NFT, isApproved: false }
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);
  // all of the erc721s and erc1155s that I own
  const { erc721s } = useContext(GraphContext);
  const availableNfts = useMemo(() => {
    const nfts: Nft[] = [];
    if (!erc721s) return nfts;
    for (const address of Object.keys(erc721s)) {
      if (!erc721s[address]) continue;
      if (!R.hasPath([address, "tokenIds"], erc721s)) continue;
      for (const tokenId of Object.keys(erc721s[address].tokenIds)) {
        let image = R.pathOr(
          "",
          [address, "tokenIds", tokenId, "image"],
          erc721s
        );
        if (image === "") {
          image = R.pathOr(
            "",
            [address, "tokenIds", tokenId, "image_url"],
            erc721s
          );
        }
        nfts.push({
          contract: erc721s[address].contract,
          tokenId,
          image,
        });
      }
    }
    return nfts;
  }, [erc721s]);

  const handleStartLend = useCallback(
    async (nft: Nft) => {
      if (!nft.contract || !renft || !currentAddress) return;
      const isApproved = await nft.contract.isApprovedForAll(
        currentAddress,
        renft.address
      );
      setSelectedNft({ ...nft, isApproved });
      setModalOpen(true);
    },
    [renft, currentAddress]
  );

  return (
    <Box>
      <LendModal nft={selectedNft} open={modalOpen} setOpen={setModalOpen} />
      <Box className="Catalogue">
        {availableNfts.map((nft) => {
          const nftId = `${nft.contract?.address ?? ""}::${nft.tokenId}`;
          return (
            <CatalogueItem
              key={nftId}
              nftId={nftId}
              nft={nft}
              handleStartLend={handleStartLend}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default LendCatalogue;
