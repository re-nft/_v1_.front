import React from "react";
import { Dialog } from "@material-ui/core";

type ModalProps = {
  open: boolean;
  handleClose: () => void;
};

const Modal: React.FC<ModalProps> = ({ children, open, handleClose }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <>{children}</>
    </Dialog>
  );
};

export default Modal;
