import React, { useCallback, useContext, useEffect, useMemo } from "react";

import Modal from "./modal";
import { StartRentNft, useStartRent } from "../hooks/useStartRent";
import { RentForm } from "../forms/rent-form";
import { Lending } from "../contexts/graph/classes";
import TransactionStateContext from "../contexts/TransactionState";

type BatchRentModalProps = {
  open: boolean;
  handleClose: () => void;
  nft: Lending[];
};

export const BatchRentModal: React.FC<BatchRentModalProps> = ({
  open,
  handleClose,
  nft,
}) => {
  const { setHash } = useContext(TransactionStateContext);
  const nfts = useMemo(() => {
    return nft.map<StartRentNft>((nft) => ({
      address: nft.address,
      tokenId: nft.tokenId,
      amount: nft.lending.lentAmount,
      lendingId: nft.lending.id,
      rentDuration: "",
      paymentToken: nft.lending.paymentToken,
    }));
  }, [nft]);

  const {
    startRent,
    isApproved,
    handleApproveAll,
    checkApprovals,
    isApprovalLoading,
  } = useStartRent();

  useEffect(() => {
    checkApprovals(nfts);
  }, [checkApprovals, nfts]);

  const handleSubmit = useCallback(
    (items: StartRentNft[]) => {
      if (isApproved) {
        return startRent(items)
          .then((tx) => {
            if (tx) return setHash(tx.hash);
            Promise.resolve(false);
          })
          .then((status) => {
            if (status) handleClose();
          });
      }
      return Promise.reject();
    },
    [handleClose, isApproved, setHash, startRent]
  );

  return (
    <Modal open={open} handleClose={handleClose}>
      <RentForm
        nfts={nft}
        handleApproveAll={handleApproveAll}
        isApproved={isApproved}
        handleSubmit={handleSubmit}
        isApprovalLoading={isApprovalLoading}
      ></RentForm>
    </Modal>
  );
};

export default BatchRentModal;
