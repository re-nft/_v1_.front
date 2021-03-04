import React from "react";
import { Dialog, Box } from "@material-ui/core";

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
      <Box style={{ background: "#550099", border: "3px solid black" }}>
        {children}
      </Box>
    </Dialog>
  );
};

export default Modal;
