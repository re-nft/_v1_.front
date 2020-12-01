import React, { useState, useCallback } from "react";
import { Box } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";

import LendModal from "./LendModal";
import { Nft } from "../types";

type LendButtonProps = {
  handleLend: (nft: Nft) => void;
  nft: Nft;
};

type StopLendButtonProps = {
  handleStopLend: (nft: Nft) => void;
  nft: Nft;
};

// todo: maybe worth supplying both: all and the ones that I lend at the same time
type LendCatalogueProps = {
  nfts: Nft[];
  iLend: boolean;
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

const StopLendButton: React.FC<StopLendButtonProps> = () => {
  return (
    <div className="Product__details">
      <span className="Product__buy">Stop Lending</span>
    </div>
  );
};

const LendCatalogue: React.FC<LendCatalogueProps> = ({ nfts, iLend }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [nft, setNft] = useState<Nft>();
  const [freshlyLent, setFreshlyLent] = useState<Nft>({
    nftAddress: "",
    tokenId: "",
  });

  const handleLend = useCallback(
    (_nft: Nft) => {
      setModalOpen(true);
      setNft(_nft);
    },
    [setModalOpen, setNft]
  );

  const handleLendModal = useCallback((_nft: Nft) => {
    setFreshlyLent(_nft);
  }, []);

  return (
    <Box>
      <LendModal
        nft={nft}
        open={modalOpen}
        setOpen={setModalOpen}
        onLend={handleLendModal}
      />
      <Box className="Catalogue">
        {nfts?.length > 0 &&
          nfts.map((nft) => {
            if (
              nft.nftAddress === freshlyLent.nftAddress &&
              nft.tokenId === freshlyLent.tokenId
            )
              return <></>;
            const nftId = `${nft.nftAddress}::${nft.tokenId}`;
            return (
              <div className="Catalogue__item" key={nftId}>
                <div
                  className="Product"
                  data-item-id={nftId}
                  data-item-image={nft.imageUrl}
                >
                  {/* TODO: the skeleton animation here does not work */}
                  <div className="Product__image">
                    <a href={nft.imageUrl}>
                      {nft.imageUrl ? (
                        <img alt="nft" src={nft.imageUrl} />
                      ) : (
                        <Skeleton
                          animation="wave"
                          variant="rect"
                          width="219"
                          height="219"
                        />
                      )}
                    </a>
                  </div>

                  <div className="Product__details">
                    <p className="Product__text_overflow">
                      <a
                        href={`https://goerli.etherscan.io/address/${nft.nftAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none", color: "black" }}
                      >
                        {nft.nftAddress}
                      </a>
                    </p>
                  </div>
                  <div className="Product__details">
                    <p className="Product__text_overflow">
                      <span className="Product__label">Token id</span>
                      <span className="Product__value">{nft.tokenId}</span>
                    </p>
                  </div>
                  <div
                    className="Product__details"
                    style={{ marginTop: "8px" }}
                  >
                    {!iLend ? (
                      <LendButton nft={nft} handleLend={handleLend} />
                    ) : (
                      <StopLendButton
                        nft={nft}
                        handleStopLend={(nft) => ({})}
                      />
                    )}
                    {/* TODO: ^ placeholder for stop lend */}
                  </div>
                </div>
              </div>
            );
          })}
      </Box>
    </Box>
  );
};

export default LendCatalogue;
