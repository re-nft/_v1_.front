import React from "react";

import { RentForm } from "renft-front/components/forms/rent/rent-form";
import Modal from "./modal";

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
