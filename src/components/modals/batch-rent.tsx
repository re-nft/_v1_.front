import React from "react";

import Modal from "./modal";
import { RentForm } from "../forms/rent/rent-form";
import { Lending } from "../../types/classes";

type BatchRentModalProps = {
  open: boolean;
  handleClose: () => void;
  nft: Lending[];
};

export const BatchRentModal: React.FC<BatchRentModalProps> = ({
  open,
  handleClose,
  nft
}) => {
  return (
    <Modal open={open} handleClose={handleClose}>
      {open && <RentForm nfts={nft} onClose={handleClose}></RentForm>}
    </Modal>
  );
};

export default BatchRentModal;
