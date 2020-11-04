import React, { useState, useCallback } from "react";
import { Box } from "@material-ui/core";

import LendModal from "./LendModal";
import { Face } from "../types";

import Switcher from "./Switcher";

type LendButtonProps = {
  handleLend: (id: string) => void;
  id: string;
};

type LendCatalogueProps = {
  data?: Face[];
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

const LendCatalogue: React.FC<LendCatalogueProps> = ({ data }) => {
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
          data.map((face) =>
            face ? (
              <div className="Catalogue__item" key={face.id}>
                <div
                  className="Product"
                  data-item-id={face.id}
                  data-item-image={face.uri}
                >
                  <div className="Product__image">
                    <a href={face.uri}>
                      <img alt="nft" src={face.uri} />
                    </a>
                  </div>
                  <div className="Product__details">
                    <LendButton id={face.id} handleLend={handleLend} />
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )
          )}
      </Box>
    </Box>
  );
};

export default LendCatalogue;
