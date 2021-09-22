import React from "react";

import Modal from "./modal";

import { LendForm } from "../forms/lend/lend-form";

type LendModalProps = {
  checkedItems: string[];
  open: boolean;
  onClose(): void;
};

export const BatchLendModal: React.FC<LendModalProps> = ({
  checkedItems,
  open,
  onClose
}) => {
  return (
    <Modal open={open} handleClose={onClose}>
      {open && <LendForm checkedItems={checkedItems} onClose={onClose}></LendForm>}
    </Modal>
  );
};

export default BatchLendModal;
