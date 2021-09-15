import React from "react";

import Modal from "./modal";

import { Nft } from "../../types/classes";

import { LendForm } from "../forms/lend/lend-form";

type LendModalProps = {
  nfts: Nft[];
  open: boolean;
  onClose(): void;
};

export const BatchLendModal: React.FC<LendModalProps> = ({
  nfts,
  open,
  onClose
}) => {
  return (
    <Modal open={open} handleClose={onClose}>
      {open && <LendForm nfts={nfts} onClose={onClose}></LendForm>}
    </Modal>
  );
};

export default BatchLendModal;
