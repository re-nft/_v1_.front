import React, { useState, useCallback, useContext, useEffect } from "react";
import { Box } from "@material-ui/core";
import Modal from "./modal";
import { Lending } from "../../../contexts/graph/classes";
import { RentNftContext } from "../../../hardhat/SymfoniContext";
import { TransactionStateContext } from "../../../contexts/TransactionState";
import { CurrentAddressContext } from "../../../hardhat/SymfoniContext";
import { ProviderContext } from "../../../hardhat/SymfoniContext";
import ActionButton from "../../forms/action-button";
import isApprovalForAll from '../../../services/is-approval-for-all';
import returnIt from '../../../services/return-it';
import setApprovalForAll from '../../../services/set-approval-for-all';

type ReturnModalProps = {
  nfts: Lending[];
  open: boolean;
  onClose: () => void;
};

export const ReturnModal: React.FC<ReturnModalProps> = ({
  nfts,
  open,
  onClose,
}) => {
  const [isApproved, setIsApproved] = useState(false);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);
  const { setHash } = useContext(TransactionStateContext);
  const [provider] = useContext(ProviderContext);
  const [nft] = nfts;

  const handleReturnNft = useCallback(
    async () => {
      if (!renft || !nft.contract) return;
      const tx = await returnIt(renft, nfts);
      const isSuccess = await setHash(tx.hash);
      if (isSuccess) {
        onClose();
      }
    },
    [renft, setHash, nfts]
  );

  const handleApproveAll = useCallback(
    async () => {
      if (!currentAddress || !renft || !nft.contract || !provider) return;
      const contract = nft.contract();
      const tx = await setApprovalForAll(renft, contract);
      setHash(tx.hash);
      const receipt = await provider.getTransactionReceipt(tx.hash);
      const status = receipt.status ?? 0;
      if (status === 1) {
        setIsApproved(true);
      }
    },
    [currentAddress, renft, provider, setHash, setIsApproved, nft]
  );

  useEffect(() => {
    if (!nft.contract || !renft || !currentAddress) return;
    const contract = nft.contract();
    isApprovalForAll(renft, contract, currentAddress).then((isApproved: boolean) => {
      setIsApproved(isApproved);
    }).catch(() => false);
  }, [isApproved, setIsApproved, nft, renft]);

  return (
    <Modal open={open} handleClose={onClose}>
      <div style={{ padding: "32px", width: "440px" }}>
        <div style={{ padding: "32px" }}>TBD</div>
        <Box>
          <div className="Nft__card" style={{ justifyContent: "center" }}>
            {!isApproved && (
              <ActionButton<Lending> title="Approve All" nft={nft} onClick={handleApproveAll}/>
            )}
            {isApproved && (
              <ActionButton<Lending> title="Return It" nft={nft} onClick={handleReturnNft}/>
            )}
          </div>
        </Box>
      </div>
    </Modal>
  );
};

export default ReturnModal;
