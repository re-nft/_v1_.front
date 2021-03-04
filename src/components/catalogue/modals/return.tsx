import React, { useState, useCallback, useContext, useEffect } from "react";
import { Box } from "@material-ui/core";
import { Nft } from "../../../contexts/graph/classes";
import Modal from "../../modal";

type ReturnModalProps = {
  nft: Nft;
  isApproved: boolean;
  open: boolean;
  onReturn(nft: Nft): void;
  onApproveAll(nft: Nft): void;
  onClose: () => void;
};

export const ReturnModal: React.FC<ReturnModalProps> = ({
  nft,
  open,
  onClose,
  isApproved,
  onReturn,
  onApproveAll,
}) => {
  const handleApprove = useCallback(() => {
    onApproveAll(nft);
  }, [onApproveAll, nft]);

  const handleReturn = useCallback(() => {
    onReturn(nft);
  }, [onReturn, nft]);

  return (
    <Modal open={open} handleClose={onClose}>
      <div style={{ padding: "32px", width: "440px" }}>
        <div style={{ padding: "32px" }}>TBD</div>
        <Box>
          <div className="Nft__card" style={{ justifyContent: "center" }}>
            {!isApproved && (
              <div className="Nft__card" onClick={handleApprove}>
                <span className="Nft__button">Approve All</span>
              </div>
            )}
            {isApproved && (
              <div className="Nft__card" onClick={handleReturn}>
                <span className="Nft__button">Return it</span>
              </div>
            )}
          </div>
        </Box>
      </div>
    </Modal>
  );
};

export default ReturnModal;
