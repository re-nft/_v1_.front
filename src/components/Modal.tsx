import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { Modal as MuiModal } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    swanky: {
      width: "400px",
      backgroundColor: "#663399",
      margin: "auto",
      border: "3px solid #000",
      boxShadow: theme.shadows[5],
      color: "white",
      textAlign: "center",
      top: "30% !important",
      left: "35% !important",
      right: "unset !important",
      bottom: "unset !important",
    },
  })
);

type ModalProps = {
  open: boolean;
  onClose: () => void;
};

const Modal: React.FC<ModalProps> = ({ children, open, onClose }) => {
  const classes = useStyles();

  return (
    <MuiModal
      open={open}
      onClose={onClose}
      className={classes.swanky}
      disableAutoFocus
    >
      <>{children}</>
    </MuiModal>
  );
};

export default Modal;
