import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Box } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import * as R from "ramda";

import GraphContext from "../contexts/Graph";
import LendModal from "./LendModal";
import { Nft, Lending } from "../types";
import { Token } from "graphql/language/ast";

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
  nft: DummyNft;
  handleLend: (nft: Nft) => void;
  handleStopLend: (lending: Lending) => void;
};

const CatalogueItem: React.FC<CatalogueItemProps> = ({
  nftId,
  nft,
  handleLend,
  handleStopLend,
}) => {
  // todo: not fully correct but sufficient
  // const isLending = (nft: Nft | Lending): nft is Lending => {
  //   return (nft as Lending).dailyRentPrice !== undefined;
  // };

  return (
    <div className="Catalogue__item" key={nftId}>
      <div className="Product" data-item-id={nftId} data-item-image={nft.image}>
        <div className="Product__image">
          <a href={nft.image}>
            <img alt="nft" src={nft.image} />
          </a>
        </div>
        <div className="Product__details">
          <p className="Product__text_overflow">
            <a
              href={`https://etherscan.io/address/${nft.address}`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none", color: "black" }}
            >
              {nft.address}
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
const LendCatalogue: React.FC<LendCatalogueProps> = ({ nfts, iLend }) => {
  const [modalOpen, setModalOpen] = useState(false);
  // all of the erc721s and erc1155s that I own
  const { erc721s } = useContext(GraphContext);
  const nftTokenId = useMemo(() => {
    const nfts: DummyNft[] = [];

    if (!erc721s) return nfts;

    console.log("erc721s", erc721s);

    for (const address of Object.keys(erc721s)) {
      if (!R.hasPath([address, "tokenIds"], erc721s)) continue;
      for (const tokenId of Object.keys(erc721s[address]?.tokenIds)) {
        nfts.push({
          address,
          tokenId,
          image: R.pathOr("", [address, "tokenIds", tokenId, "image"], erc721s),
          // //@ts-ignore
          // image: erc721s[address].tokenIds[tokenId].meta?.image ?? "",
        });
      }
    }

    return nfts;
  }, [erc721s]);

  return (
    <Box>
      {/* <LendModal
        nft={nft}
        open={modalOpen}
        setOpen={setModalOpen}
        onLend={handleLend}
      /> */}
      <Box className="Catalogue">
        {nftTokenId.map((nft) => {
          const nftId = `${nft.address}::${nft.tokenId}`;
          return (
            <CatalogueItem
              key={nftId}
              nftId={nftId}
              nft={nft}
              handleLend={() => {
                return;
              }}
              handleStopLend={() => {
                return;
              }}
            />
          );
        })}
        {/* {erc721s.map((nft) => {
          // const nftId = `${nft.nftAddress}::${nft.tokenId}`;
          // if (
          //   nft.nftAddress === freshlyLent.nftAddress &&
          //   nft.tokenId === freshlyLent.tokenId
          // )
          //   return <React.Fragment key={nftId} />;

          return (
            <CatalogueItem
              key={nft.tokenId}
              nftId={nft.tokenId ?? ""}
              nft={nft}
              handleLend={handleLend}
              handleStopLend={handleStopLend}
            />
          );
        })} */}
        {/* {iLend &&
          user.lending.length > 0 &&
          user.lending.map((lending) => {
            const nftId = `${lending.nftAddress}::${lending.tokenId}`;
            return (
              <CatalogueItem
                key={nftId}
                nftId={nftId}
                nft={lending}
                handleLend={handleLend}
                handleStopLend={handleStopLend}
              />
            );
          })} */}
      </Box>
    </Box>
  );
};

export default LendCatalogue;
