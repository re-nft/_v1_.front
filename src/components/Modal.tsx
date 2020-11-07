import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { Modal as MuiModal } from "@material-ui/core";

// ! fix positioning without breaking the modal close
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    swanky: {
      backgroundColor: "#663399",
      border: "3px solid #000",
      boxShadow: theme.shadows[5],
      color: "white",
      textAlign: "center",
      top: "0 !important",
      left: "0 !important",
      bottom: "unset !important",
      right: "unset !important",
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
    <MuiModal open={open} onClose={onClose} className={classes.swanky}>
      <>{children}</>
    </MuiModal>
  );
};

export default Modal;
