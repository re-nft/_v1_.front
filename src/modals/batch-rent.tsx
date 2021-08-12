import React, { useCallback, useEffect, useMemo } from "react";

import Modal from "./modal";
import { StartRentNft, useStartRent } from "../hooks/contract/useStartRent";
import { RentForm } from "../forms/rent-form";
import { Lending } from "../contexts/graph/classes";
import { TransactionStatus } from "../hooks/useTransactionWrapper";
import { Observable } from "rxjs";

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
  const nfts = useMemo(() => {
    return nft.map<StartRentNft>((nft) => ({
      address: nft.address,
      tokenId: nft.tokenId,
      amount: nft.lending.lentAmount,
      lendingId: nft.lending.id,
      rentDuration: "",
      paymentToken: nft.lending.paymentToken,
      isERC721: nft.isERC721,
    }));
  }, [nft]);

  const {
    startRent,
    isApproved,
    handleApproveAll,
    checkApprovals,
    approvalStatus,
  } = useStartRent();

  useEffect(() => {
    checkApprovals(nfts);
  }, [checkApprovals, nfts]);

  const handleSubmit = useCallback(
    (items: StartRentNft[]): Observable<TransactionStatus> => {
      return startRent(items);
    },
    [startRent]
  );
  return (
    <Modal open={open} handleClose={handleClose}>
      {open && (
        <RentForm
          nfts={nft}
          handleApproveAll={handleApproveAll}
          isApproved={isApproved}
          handleSubmit={handleSubmit}
          approvalStatus={approvalStatus}
          onClose={handleClose}
        ></RentForm>
      )}
    </Modal>
  );
};

export default BatchRentModal;
