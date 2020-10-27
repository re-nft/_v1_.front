import React, { useCallback, useState, useContext, useEffect } from "react";
import Modal from '@material-ui/core/Modal';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import { getGanFace } from "../api/ganFace";
// import { getPerson } from "../api/getPerson";
import { pinToIpfs } from "../api/pinToIpfs";
import FunnySpinner from './Spinner';
import { abis, addresses } from "../contracts";
import DappContext from "../contexts/Dapp";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    swanky: {
      flex: "0",
      width: 600,
      height: 600,
      backgroundColor: "#663399",
      margin: "auto",
      border: '3px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      color: "white",
      textAlign: "center"
    },
  }),
);

export default ({open, handleClose}) => {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [yourFace, setYourFace] = useState<Blob>();
  const [isMinting, setIsMinting] = useState(false);
  const [faceContract, setFaceContract] = useState();
  const { wallet, web3, setWeb3 } = useContext(DappContext);

  // useEffect(() => {
  //   console.log(wallet);
  //   console.log(addresses)
  // }, [wallet]);

  const getFace = useCallback(async () => {
    setIsLoading(true);
    const ganFace = await getGanFace();
    // const person = await getPerson();
    const url = URL.createObjectURL(ganFace);
    const img = document.getElementById('face');
    img.src = url;
    setYourFace(ganFace);
    setIsLoading(false);
    pinToIpfs({blob: ganFace});
  }, [getGanFace]);

  const mintFace = useCallback(async () => {
    setIsMinting(true);

    if (web3 == null) {
      console.error("no web3 instance. You must connect your metamask wallet to Goerli");
      return;
    }

    let contract = faceContract;

    if (faceContract == null) {
      contract = web3.eth.Contract(abis.goerli.face, addresses.goerli.face);
      if (contract != null) {
        setFaceContract(contract);
      } else {
        console.error("could not set face contract");
      }
    }

    const receipt = await contract.awardGanFace(wallet.account, "https://pinata.link");

    console.log("face minted");
    console.log(receipt);

    setIsMinting(false);
  }, [web3, faceContract]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      className={classes.swanky}
    >
      <div style={{display: "flex", flexDirection: "column", alignContent: "space-between", height: "100%"}}>
        <div>
          |-: Generate your GAN face :-|
        </div>
        <div className="Product__image" style={{maxWidth: "80%", maxHeight: "80%", margin: "auto"}}>
          <img id="face" style={{width: "100%", height: "100%"}} src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Anonymous_SVG.svg">
          </img>
        </div>
        {isLoading && <FunnySpinner />}
        <div onClick={getFace} role="button" className="Product__button" style={{marginTop: "auto", flex: "0", width: "200px", border: "3px solid black", margin: "8px auto 0px auto", textAlign: "center"}}>
          Give me a face
        </div>
        <div onClick={mintFace} role="button" className="Product__button" style={{width: "200px", border: "3px solid black", margin: "8px auto 8px auto", textAlign: "center"}}>
          Mint my face
        </div>
      </div>
    </Modal>
  )
}