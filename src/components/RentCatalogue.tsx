import React, { useCallback, useContext, useState } from "react";
import { Box, Tooltip } from "@material-ui/core";

// contexts
import DappContext from "../contexts/Dapp";
import Contracts from "../contexts/Contracts";
import { addresses } from "../contracts";
import { Lending } from "../types";
import RentModal from "./RentModal";

type RentCatalogueProps = {
  data?: Lending[];
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

type ReturnButtonProps = {
  handleReturn: (id: string) => void;
  id: string;
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

const ReturnButton: React.FC<ReturnButtonProps> = ({ handleReturn, id }) => {
  const handleClick = useCallback(() => {
    handleReturn(id);
  }, [handleReturn, id]);

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

const RentCatalogue: React.FC<RentCatalogueProps> = ({ data, iBorrow }) => {
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
    async (tokenId: string) => {
      try {
        if (!rent?.returnOne) return;
        // ! TODO: hack. generalise
        const resolvedId = tokenId.split("::")[1];
        // ! TODO: remove this addresses.goerli.face. Generalise
        await rent?.returnOne(addresses.goerli.face, resolvedId);
      } catch (err) {
        // TODO: add the notification here
        // TODO: add the UX for busy (loading spinner)
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
        {data &&
          data.length > 0 &&
          data.map((nft) => {
            return (
              <div className="Catalogue__item" key={nft.id}>
                <div
                  className="Product"
                  data-item-id={nft.id}
                  data-item-image={nft.face.uri}
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
