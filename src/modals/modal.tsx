import React from "react";
import { Dialog } from "@headlessui/react";

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
      <div className="flex items-center justify-center min-h-screen min-w-screen ">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div
          className="flex-1 flex flex-col"
          style={{
            background: "rgb(238, 230, 246)",
          }}
        >
          {children}
        </div>
      </div>
    </Dialog>
  );
};

export default Modal;
