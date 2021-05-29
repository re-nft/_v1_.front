import React, { useCallback } from "react";
import ActionButton from "../components/action-button";
import { ReturnNft, useReturnIt } from "../hooks/useReturnIt";
import Modal from "./modal";

type ReturnModalProps = {
  nfts: ReturnNft[];
  open: boolean;
  onClose: (nfts?: ReturnNft[]) => void;
};

export const ReturnModal: React.FC<ReturnModalProps> = ({
  nfts,
  open,
  onClose,
}) => {
  const [nft] = nfts;
  const returnIt = useReturnIt(nfts);

  const handleReturnNft = useCallback(async () => {
    const isSuccess = await returnIt();
    if (isSuccess) {
      onClose(nfts);
    }
  }, [returnIt, onClose, nfts]);

  return (
    <Modal open={open} handleClose={() => onClose()}>
      <div className="modal-dialog-section">
        <div className="modal-dialog-title">Do you want to return?</div>
        <div className="modal-dialog-button">
          <ActionButton<ReturnNft>
            title="Return It"
            nft={nft}
            onClick={handleReturnNft}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ReturnModal;
