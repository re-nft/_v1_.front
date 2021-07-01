import React from "react";
import { Dialog, Slide } from "@material-ui/core";
import { TransitionProps } from "@material-ui/core/transitions";

type ModalProps = {
  open: boolean;
  handleClose: () => void;
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<unknown, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const Modal: React.FC<ModalProps> = ({
  children,
  open,
  handleClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      keepMounted
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <div className="modal-dialog">{children}</div>
    </Dialog>
  );
};

export default Modal;
