import React, { useCallback, useState, useContext, useEffect } from "react";
import Modal from "@material-ui/core/Modal";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

import { getGanFace } from "../api/ganFace";
// import { getPerson } from "../api/getPerson";
import { pinToIpfs } from "../api/pinToIpfs";
import FunnySpinner from "./Spinner";
import { abis, addresses } from "../contracts";
import DappContext from "../contexts/Dapp";

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
  const [counter, setCounter] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [yourFace, setYourFace] = useState<Blob>();
  const [isMinting, setIsMinting] = useState(false);
  const [pin, setPin] = useState();
  const [faceContract, setFaceContract] = useState();
  const { wallet, web3, setWeb3 } = useContext(DappContext);

  const getFace = useCallback(async () => {
    setIsLoading(true);
    setCounter(counter + 1);
    const ganFace = await getGanFace();
    // const person = await getPerson();
    const url = URL.createObjectURL(ganFace);
    const img = document.getElementById("face");
    img.src = url;

    setYourFace(ganFace);
    const _pin = await pinToIpfs({ blob: ganFace });
    const _pinData = await _pin.json();
    setPin(_pinData);
    setIsLoading(false);
  }, [getGanFace]);

  const mintFace = useCallback(async () => {
    setIsMinting(true);

    if (web3 == null) {
      console.debug(
        "no web3 instance. You must connect your metamask wallet to Goerli"
      );
      return;
    }

    let contract = faceContract;

    if (faceContract == null) {
      contract = new web3.eth.Contract(
        abis.goerli.face.abi,
        addresses.goerli.face
      );
      if (contract != null) {
        setFaceContract(contract);
      } else {
        console.debug("could not set face contract");
      }
    }

    const receipt = await contract.methods
      .awardGanFace(
        wallet.account,
        pin.IpfsHash ? `https://gateway.pinata.cloud/ipfs/${pin.IpfsHash}` : ""
      )
      .send({ from: wallet.account });

    setIsMinting(false);
  }, [web3, faceContract, wallet, pin]);

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
        {isLoading && <FunnySpinner />}
        <div style={{ display: "flex" }}>
          <button
            onClick={getFace}
            role="button"
            disabled={counter > 4}
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
              isLoading || pin == null || pin.IpfsHash == null || isMinting
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
