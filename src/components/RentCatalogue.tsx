import React, { useCallback, useContext, useState } from "react";
import { Box, Tooltip } from "@material-ui/core";

import DappContext from "../contexts/Dapp";
import Contracts from "../contexts/Contracts";
import { Nft } from "../types";
import RentModal from "./RentModal";

type RentCatalogueProps = {
  nfts: Nft[];
  iBorrow: boolean;
};

type RentButtonProps = {
  handleRent: (
    id: string,
    nftPrice: number,
    borrowPrice: number,
    maxDuration: number
  ) => void;
  id: string;
  nftPrice: number;
  borrowPrice: number;
  maxDuration: number;
};

type handleReturnArgs = {
  nft: Nft;
  lendingId: string;
  gasSponsor?: string;
};
type handleReturnFunc = ({
  nft,
  lendingId,
  gasSponsor,
}: handleReturnArgs) => void;

type ReturnButtonProps = {
  handleReturn: handleReturnFunc;
  nft: Nft;
  lendingId: handleReturnArgs["lendingId"];
  gasSponsor?: handleReturnArgs["gasSponsor"];
};

type NumericFieldProps = {
  text: string;
  value: string;
  unit: string;
};

// ! this number conversion may fail if non-number is passed
// but since it comes out of blockchain, this should always be correct
const NumericField: React.FC<NumericFieldProps> = ({ text, value, unit }) => (
  <div className="Product__details">
    <p className="Product__text_overflow">
      <span className="Product__label">{text}</span>
      <Tooltip title={value}>
        <span className="Product__value">{`${unit} ${Number(value).toFixed(
          2
        )}`}</span>
      </Tooltip>
    </p>
  </div>
);

const RentButton: React.FC<RentButtonProps> = ({
  handleRent,
  id,
  nftPrice,
  borrowPrice,
  maxDuration,
}) => {
  const handleClick = useCallback(() => {
    handleRent(id, nftPrice, borrowPrice, maxDuration);
  }, [handleRent, id, nftPrice, borrowPrice, maxDuration]);

  return (
    <span
      className="Product__buy"
      onClick={handleClick}
      style={{ marginTop: "8px" }}
    >
      Rent now
    </span>
  );
};

const ReturnButton: React.FC<ReturnButtonProps> = ({
  handleReturn,
  nft,
  lendingId,
  gasSponsor,
}) => {
  const handleClick = useCallback(() => {
    handleReturn({ nft, lendingId, gasSponsor });
  }, [handleReturn, nft, lendingId, gasSponsor]);

  return (
    <span
      className="Product__buy"
      onClick={handleClick}
      style={{ marginTop: "8px" }}
    >
      Return now
    </span>
  );
};

const RentCatalogue: React.FC<RentCatalogueProps> = ({ nfts, iBorrow }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [faceId, setFaceId] = useState<string>("");
  const [borrowPrice, setBorrowPrice] = useState<number>(0);
  const [nftPrice, setNftPrice] = useState<number>(0);
  const [maxDuration, setMaxDuration] = useState<number>(0);
  const { web3 } = useContext(DappContext);
  const { rent } = useContext(Contracts);

  const handleClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleRent = useCallback(
    (
      faceId: string,
      nftPrice: number,
      borrowPrice: number,
      maxDuration: number
    ) => {
      setModalOpen(true);
      setFaceId(faceId);
      setBorrowPrice(borrowPrice);
      setNftPrice(nftPrice);
      setMaxDuration(maxDuration);
    },
    []
  );

  const handleReturn = useCallback(
    async ({
      nft,
      lendingId,
      gasSponsor,
    }: {
      nft: Nft;
      lendingId: string;
      gasSponsor?: string;
    }) => {
      // async (nft: Nft, lendingId: string, gasSponsor?: string) => {
      try {
        if (!rent?.returnOne || !nft?.tokenId) return;
        await rent?.returnOne(
          nft.nftAddress,
          nft.tokenId,
          lendingId,
          gasSponsor
        );
      } catch (err) {
        console.debug("could not return the NFT");
      }
    },
    [rent]
  );

  const fromWei = (v?: number): string =>
    v && web3 ? web3?.utils.fromWei(String(v), "ether") : "";

  return (
    <Box>
      <RentModal
        faceId={faceId}
        open={modalOpen}
        handleClose={handleClose}
        borrowPrice={borrowPrice}
        nftPrice={nftPrice}
        maxDuration={maxDuration}
      />
      <Box className="Catalogue">
        {nfts.length > 0 &&
          nfts.map((nft) => {
            if (!nft.tokenId) return <></>;
            const id = `${nft.nftAddress}::${nft.tokenId}`;

            return (
              <div className="Catalogue__item" key={id}>
                <div
                  className="Product"
                  data-item-id={id}
                  data-item-image={nft.imageUrl}
                >
                  <div className="Product__image">
                    <a href={nft.face.uri}>
                      <img alt="nft" src={nft.face.uri} />
                    </a>
                  </div>
                  <div className="Product__details">
                    <p className="Product__text_overflow">
                      <a
                        href={`https://goerli.etherscan.io/address/${nft.address}`}
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
                      <span className="Product__value">
                        {nft.id.split("::")[1]}
                      </span>
                    </p>
                  </div>
                  <NumericField
                    text="Daily price"
                    value={fromWei(nft.borrowPrice)}
                    unit="fDAI"
                  />
                  <NumericField
                    text="Max duration"
                    value={String(nft.maxDuration)}
                    unit="days"
                  />
                  <NumericField
                    text="Collateral"
                    value={fromWei(nft.nftPrice)}
                    unit="fDAI"
                  />
                  <div className="Product__details">
                    {!iBorrow ? (
                      <RentButton
                        handleRent={handleRent}
                        id={nft.face.id}
                        borrowPrice={Number(fromWei(nft.borrowPrice))}
                        nftPrice={Number(fromWei(nft.nftPrice))}
                        maxDuration={Number(nft.maxDuration)}
                      />
                    ) : (
                      <ReturnButton
                        id={nft.face.id}
                        handleReturn={handleReturn}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </Box>
    </Box>
  );
};

export default RentCatalogue;
