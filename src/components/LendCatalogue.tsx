import React, { useState, useCallback } from "react";
import { Box } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";

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

const LendCatalogue: React.FC<LendCatalogueProps> = ({ data, iLend }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [faceId, setFaceId] = useState("");
  const handleLend = useCallback(
    (id) => {
      setModalOpen(true);
      setFaceId(id);
    },
    [setModalOpen, setFaceId]
  );

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
                      <StopLendButton id={face.id} handleStopLend={() => {}} />
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
