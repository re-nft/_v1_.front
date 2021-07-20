import React, { useCallback } from "react";

import Modal from "./modal";

import { Nft } from "../contexts/graph/classes";
import { useNFTApproval } from "../hooks/useNFTApproval";

import { useStartLend } from "../hooks/useStartLend";
import { LendForm, LendInputDefined } from "../forms/lend-form";

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
  const startLend = useStartLend();
  const {
    handleApproveAll,
    isApproved,
    approvalStatus
  } = useNFTApproval(nfts);
  
  const handleLend = useCallback(
    (lendingInputs: LendInputDefined[]) => {
      return startLend(lendingInputs);
    },

    [startLend, onClose]
  );

  return (
    <Modal open={open} handleClose={onClose}>
      {open && (
        <LendForm
          nfts={nfts}
          isApproved={isApproved}
          handleApproveAll={handleApproveAll}
          handleSubmit={handleLend}
          approvalStatus={approvalStatus}
          onClose={onClose}
        ></LendForm>
      )}
    </Modal>
  );
};

export default BatchLendModal;
