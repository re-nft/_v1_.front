import React, { useState, useCallback, useContext, useMemo } from "react";
import { Box } from "@material-ui/core";
// import Skeleton from "@material-ui/lab/Skeleton";
import * as R from "ramda";

import GraphContext from "../contexts/Graph";
import LendModal from "./LendModal";
import { Nft, Lending } from "../types";

type LendButtonProps = {
  handleLend: (nft?: DummyNft) => void;
  nft?: DummyNft;
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

type Address = string;
type TokenId = string;
type URI = string;

type DummyNft = {
  address: Address;
  tokenId: TokenId;
  image: URI;
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
  nft?: DummyNft;
  handleStartLend: (nft?: DummyNft) => void;
};

const CatalogueItem: React.FC<CatalogueItemProps> = ({
  nftId,
  nft,
  handleStartLend,
}) => {
  return (
    <div className="Catalogue__item" key={nftId}>
      <div
        className="Product"
        data-item-id={nftId}
        data-item-image={nft?.image ?? ""}
      >
        <div className="Product__image">
          <a href={nft?.image ?? ""} target="_blank" rel="noreferrer">
            <img alt="nft" src={nft?.image ?? ""} />
          </a>
        </div>
        <div className="Product__details">
          <p className="Product__text_overflow">
            <a
              href={`https://etherscan.io/address/${nft?.address ?? ""}`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none", color: "black" }}
            >
              {nft?.address ?? ""}
            </a>
          </p>
        </div>
        <div className="Product__details">
          <p className="Product__text_overflow">
            <span className="Product__label">Token id</span>
            <span className="Product__value">{nft?.tokenId ?? ""}</span>
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

// todo: iLend is an extra degree of freedom that is not required
// iLend can be inferred from the type of nfts. Moreover,
// we should not use the union type here for NFT and Lending.
// Cleanly separate these two, potentially into different components
const LendCatalogue: React.FC<LendCatalogueProps> = () => {
  const [selectedNft, setSelectedNft] = useState<DummyNft | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  // all of the erc721s and erc1155s that I own
  const { erc721s } = useContext(GraphContext);
  const nftTokenId = useMemo(() => {
    const nfts: DummyNft[] = [];
    if (!erc721s) return nfts;
    for (const address of Object.keys(erc721s)) {
      if (!R.hasPath([address, "tokenIds"], erc721s)) continue;
      for (const tokenId of Object.keys(erc721s[address]?.tokenIds)) {
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
          address,
          tokenId,
          image,
        });
      }
    }
    return nfts;
  }, [erc721s]);

  const handleStartLend = useCallback((nft?: DummyNft) => {
    setSelectedNft(nft);
    setModalOpen(true);
  }, []);

  return (
    <Box>
      <LendModal nft={selectedNft} open={modalOpen} setOpen={setModalOpen} />
      <Box className="Catalogue">
        {nftTokenId.map((nft) => {
          const nftId = `${nft.address}::${nft.tokenId}`;
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
