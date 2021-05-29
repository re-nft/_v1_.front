import React, { useCallback, useEffect, useMemo } from "react";

import Modal from "./modal";
import { StartRentNft, useStartRent } from "../hooks/useStartRent";
import { RentForm } from "../forms/rent-form";
import { useCheckedLendingItems } from "../controller/batch-controller";

type BatchRentModalProps = {
  open: boolean;
  handleClose: () => void;
};

export const BatchRentModal: React.FC<BatchRentModalProps> = ({
  open,
  handleClose,
}) => {
  const nft = useCheckedLendingItems();

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

  const { startRent, isApproved, handleApproveAll, checkApprovals } =
    useStartRent();

  useEffect(() => {
    checkApprovals(nfts);
  }, [checkApprovals, nfts]);

  const handleSubmit = useCallback(
    (items: StartRentNft[]) => {
      if (isApproved) {
        startRent(items);
        handleClose();
      }
    },
    [handleClose, isApproved, startRent]
  );

  return (
    <Modal open={open} handleClose={handleClose}>
      <RentForm
        nfts={nft}
        handleApproveAll={handleApproveAll}
        isApproved={isApproved}
        handleSubmit={handleSubmit}
      ></RentForm>
    </Modal>
  );
};

export default BatchRentModal;
