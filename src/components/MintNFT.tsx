import React, { useContext } from "react";
import Modal from "@material-ui/core/Modal";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

// contexts
import GanFacesContext, { GanFaceStages } from "../contexts/GanFaces";

import FunnySpinner from "./Spinner";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    swanky: {
      flex: "0",
      width: 600,
      height: 650,
      backgroundColor: "#663399",
      margin: "auto",
      border: "3px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      color: "white",
      textAlign: "center"
    }
  })
);

export default ({ open, handleClose }) => {
  const classes = useStyles();
  const { getFace, mintFace, numFacesGenerated, stages } = useContext(
    GanFacesContext
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      className={classes.swanky}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignContent: "space-between",
          height: "100%"
        }}
      >
        <div>|-: Generate your GAN face :-|</div>
        <div
          className="Product__image"
          style={{ maxWidth: "80%", maxHeight: "80%", margin: "32px auto" }}
        >
          <img
            id="face"
            style={{ width: "100%", height: "100%" }}
            src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Anonymous_SVG.svg"
          ></img>
        </div>
        {stages !== GanFaceStages.Idle &&
          stages !== GanFaceStages.ReadyForMinting && <FunnySpinner />}
        <div style={{ display: "flex" }}>
          <button
            onClick={getFace}
            role="button"
            disabled={
              numFacesGenerated > 9 ||
              (stages !== GanFaceStages.Idle &&
                stages !== GanFaceStages.ReadyForMinting)
            }
            className="Product__button"
            style={{
              marginTop: "auto",
              flex: "1",
              width: "200px",
              border: "3px solid black",
              margin: "0 8px 8px 0",
              textAlign: "center"
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
              textAlign: "center"
            }}
          >
            Mint my face
          </button>
        </div>
      </div>
    </Modal>
  );
};
