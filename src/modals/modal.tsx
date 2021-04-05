import React from "react";
import { Dialog } from "@material-ui/core";

type ModalProps = {
  open: boolean;
  handleClose: () => void;
};

export const Modal: React.FC<ModalProps> = ({
  children,
  open,
  handleClose,
}) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <div className="modal-dialog">{children}</div>
    </Dialog>
  );
};

export default Modal;
