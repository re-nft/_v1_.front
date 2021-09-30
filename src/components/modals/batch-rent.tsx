import React from "react";

import Modal from "./modal";
import { RentForm } from "../forms/rent/rent-form";

type BatchRentModalProps = {
  open: boolean;
  handleClose: () => void;
  checkedItems: string[];
};

export const BatchRentModal: React.FC<BatchRentModalProps> = ({
  open,
  handleClose,
  checkedItems
}) => {
  return (
    <Modal open={open} handleClose={handleClose}>
      {open && (
        <RentForm checkedItems={checkedItems} onClose={handleClose}></RentForm>
      )}
    </Modal>
  );
};

export default BatchRentModal;
