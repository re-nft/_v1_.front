import React from "react";
import Modal from '@material-ui/core/Modal';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    swanky: {
      width: 400,
      height: 400,
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

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      className={classes.swanky}
    >
      <div>
        |-: Generate your GAN face :-|
      </div>

    </Modal>
  )
}