import React, { useState, useCallback, useContext, useMemo } from "react";
import { Box } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import Contracts from "../contexts/Contracts";
import { Address } from "../types";

import LendModal from "./LendModal";
import { Face } from "../types";

type LendButtonProps = {
  handleLend: (id: string) => void;
  id: string;
};

type StopLendButtonProps = {
  handleStopLend: (id: string) => void;
  id: string;
};

type LendCatalogueProps = {
  data?: Face[];
  iLend: boolean;
};

type ClaimButtonProps = {
  handleClaim: (id: string, nftAddress: string) => void;
  id: string;
  nftAddress: string;
};

type NftAndId = {
  nftAddress: Address;
  tokenId: string;
};

const LendButton: React.FC<LendButtonProps> = ({ handleLend, id }) => {
  const handleClick = useCallback(() => {
    handleLend(id);
  }, [handleLend, id]);

  return (
    <div className="Product__details">
      <span className="Product__buy" onClick={handleClick}>
        Lend now
      </span>
    </div>
  );
};

const StopLendButton: React.FC<StopLendButtonProps> = ({
  handleStopLend,
  id,
}) => {
  return (
    <div className="Product__details">
      <span className="Product__buy">Stop Lending</span>
    </div>
  );
};

const ClaimButton: React.FC<ClaimButtonProps> = ({
  handleClaim,
  id,
  nftAddress,
}) => {
  const handleClick = useCallback(() => {
    handleClaim(id, nftAddress);
  }, [handleClaim, id, nftAddress]);

  return (
    <span
      className="Product__buy"
      onClick={handleClick}
      style={{ marginTop: "8px" }}
    >
      Claim Collateral
    </span>
  );
};

const LendCatalogue: React.FC<LendCatalogueProps> = ({ data, iLend }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [faceId, setFaceId] = useState("");
  const { rent } = useContext(Contracts);

  const handleLend = useCallback(
    (id) => {
      setModalOpen(true);
      setFaceId(id);
    },
    [setModalOpen, setFaceId]
  );

  const handleClaim = useCallback(
    async (tokenId: string, address: string) => {
      try {
        if (!rent?.claimCollateral) return;
        // ! TODO: hack. generalise
        const resolvedId = tokenId.split("::")[1];
        await rent?.claimCollateral(address, resolvedId);
      } catch (err) {
        // TODO: add the notification here
        // TODO: add the UX for busy (loading spinner)
        console.debug("could not return the NFT");
      }
    },
    [rent]
  );

  const getNftAndId: NftAndId = useMemo(() => {
    const parts = faceId.split("::");
    if (parts.length < 2) {
      return {
        nftAddress: "",
        tokenId: "",
      };
    }
    return {
      nftAddress: parts[0],
      tokenId: parts[1],
    };
  }, [faceId]);

  return (
    <Box>
      <LendModal faceId={faceId} open={modalOpen} setOpen={setModalOpen} />
      <Box className="Catalogue">
        {data &&
          data.length > 0 &&
          data.map((face) => {
            const parts = face.id.split("::");
            let [addr, id] = ["", ""];
            if (parts.length === 2) {
              addr = parts[0];
              id = parts[1];
            }

            return (
              <div className="Catalogue__item" key={face.id}>
                <div
                  className="Product"
                  data-item-id={face.id}
                  data-item-image={face.uri}
                >
                  <div className="Product__image">
                    <a href={face.uri}>
                      {face.uri ? (
                        <img alt="nft" src={face.uri} />
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
                        href={`https://goerli.etherscan.io/address/${addr}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none", color: "black" }}
                      >
                        {addr}
                      </a>
                    </p>
                  </div>
                  <div className="Product__details">
                    <p className="Product__text_overflow">
                      <span className="Product__label">Token id</span>
                      <span className="Product__value">{id}</span>
                    </p>
                  </div>
                  <div
                    className="Product__details"
                    style={{ marginTop: "8px" }}
                  >
                    {!iLend ? (
                      <LendButton id={face.id} handleLend={handleLend} />
                    ) : (
                      // need claim collateral option here as well since the lent nft's are shown here once someone rents it
                      <div>
                        <StopLendButton
                          id={face.id}
                          handleStopLend={() => {}}
                        />
                        <ClaimButton
                          handleClaim={handleClaim}
                          id={getNftAndId.tokenId}
                          nftAddress={getNftAndId.nftAddress}
                        />
                      </div>
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
