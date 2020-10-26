import React, { useCallback, useState } from "react";
import Modal from '@material-ui/core/Modal';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import { getGanFace } from "../api/ganFace";
// import { getPerson } from "../api/getPerson";
import { pinToIpfs } from "../api/pinToIpfs";
import FunnySpinner from './Spinner';

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
  const [yourFace, setYourFace] = useState(null);
  const getFace = useCallback(async () => {
    setIsLoading(true);
    const face = await getGanFace();
    // const person = await getPerson();
    const url = URL.createObjectURL(face);
    const img = document.getElementById('face');
    img.src = url;
    setYourFace(face);
    setIsLoading(false);
    pinToIpfs({blob: face});
  }, [getGanFace]);

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
        <div role="button" className="Product__button" style={{width: "200px", border: "3px solid black", margin: "8px auto 8px auto", textAlign: "center"}}>
          Mint my face
        </div>
      </div>
    </Modal>
  )
}