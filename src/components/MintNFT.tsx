import React, { useContext, useMemo } from "react";

// contexts
import GanFacesContext, { GanFaceStages } from "../contexts/GanFaces";

import FunnySpinner from "./Spinner";
import Modal from "./Modal";

type MintNftProps = {
  open: boolean;
  handleClose: () => void;
};

const MAX_ALLOWED_FACE_GENS = 9;

const MintNft: React.FC<MintNftProps> = ({ open, handleClose }) => {
  const { getFace, mintFace, numFacesGenerated, stages } = useContext(
    GanFacesContext
  );
  const isDisabled = useMemo(() => {
    return (
      numFacesGenerated > MAX_ALLOWED_FACE_GENS ||
      (stages !== GanFaceStages.Idle &&
        stages !== GanFaceStages.ReadyForMinting)
    );
  }, [numFacesGenerated, stages]);

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      aria-labelledby="generating GAN face"
      aria-describedby="to play around with the website we have given you the ability to generate an NFT"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignContent: "space-between",
          height: "100%",
          padding: "32px",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          |-: Generate your GAN face :-|
        </div>
        <div
          className="Product__image"
          style={{ maxWidth: "90%", maxHeight: "90%", margin: "32px auto" }}
        >
          <img
            id="face"
            style={{
              width: "75%",
              height: "75%",
              marginLeft: "auto",
              marginRight: "auto",
            }}
            src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Anonymous_SVG.svg"
          ></img>
        </div>
        {stages !== GanFaceStages.Idle &&
          stages !== GanFaceStages.ReadyForMinting && <FunnySpinner />}
        <div style={{ display: "flex" }}>
          <button
            onClick={getFace}
            role="button"
            disabled={isDisabled}
            className="Product__button"
            style={{
              marginTop: "auto",
              flex: "1",
              width: "200px",
              border: "3px solid black",
              margin: "0 8px 8px 0",
              textAlign: "center",
            }}
          >
            Give me a face
          </button>
          <button
            onClick={mintFace}
            role="button"
            disabled={
              stages !== GanFaceStages.Idle &&
              stages !== GanFaceStages.ReadyForMinting
            }
            className="Product__button"
            style={{
              width: "200px",
              flex: "1",
              border: "3px solid black",
              margin: "0 0 8px 0",
              textAlign: "center",
            }}
          >
            Mint my face
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MintNft;
