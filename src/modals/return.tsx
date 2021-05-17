import React, { useState, useCallback, useContext, useEffect } from "react";
import Modal from "./modal";
import { Renting } from "../contexts/graph/classes";
import { ReNFTContext } from "../hardhat/SymfoniContext";
import { TransactionStateContext } from "../contexts/TransactionState";
import { ProviderContext } from "../hardhat/SymfoniContext";
import ActionButton from "../components/action-button";
import isApprovalForAll from "../services/is-approval-for-all";
import returnIt from "../services/return-it";
import setApprovalForAll from "../services/set-approval-for-all";
import { CurrentAddressContextWrapper } from "../contexts/CurrentAddressContextWrapper";

type ReturnModalProps = {
  nfts: Renting[];
  open: boolean;
  onClose: () => void;
};

export const ReturnModal: React.FC<ReturnModalProps> = ({
  nfts,
  open,
  onClose,
}) => {
  const [isApproved, setIsApproved] = useState(false);
  const [currentAddress] = useContext(CurrentAddressContextWrapper);
  const { instance: renft } = useContext(ReNFTContext);
  const { setHash } = useContext(TransactionStateContext);
  const [provider] = useContext(ProviderContext);
  const [nft] = nfts;

  const handleReturnNft = useCallback(async () => {
    if (!renft || !nft.contract) return;
    const tx = await returnIt(renft, nfts);
    const isSuccess = await setHash(tx.hash);
    if (isSuccess) {
      onClose();
    }
  }, [renft, setHash, nfts, nft, onClose]);

  const handleApproveAll = useCallback(async () => {
    if (!currentAddress || !renft || !provider) return;
    const [tx] = await setApprovalForAll(renft, nfts);
    setHash(tx.hash);
    const receipt = await provider.getTransactionReceipt(tx.hash);
    const status = receipt.status ?? 0;
    if (status === 1) {
      setIsApproved(true);
    }
  }, [currentAddress, renft, provider, setHash, setIsApproved, nfts]);

  useEffect(() => {
    if (!renft || !currentAddress) return;
    isApprovalForAll(renft, nfts, currentAddress)
      .then((isApproved) => {
        setIsApproved(isApproved);
      })
      .catch(() => {
        console.warn("return modal issue with fetch is approval for all");
      });
  }, [nfts, currentAddress, setIsApproved, renft]);

  return (
    <Modal open={open} handleClose={onClose}>
      <div className="modal-dialog-section">
        <div className="modal-dialog-title">Do you want to return?</div>
        <div className="modal-dialog-button">
          {!isApproved && (
            <ActionButton<Renting>
              title="Approve All"
              nft={nft}
              onClick={handleApproveAll}
            />
          )}
          {isApproved && (
            <ActionButton<Renting>
              title="Return It"
              nft={nft}
              onClick={handleReturnNft}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReturnModal;
