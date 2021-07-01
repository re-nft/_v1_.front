import React, { useCallback, useEffect, useMemo } from "react";

import Modal from "./modal";
import { StartRentNft, useStartRent } from "../hooks/useStartRent";
import { RentForm } from "../forms/rent-form";
import { Lending } from "../contexts/graph/classes";

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
      isERC721: nft.isERC721
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
    (items: StartRentNft[]): Promise<[boolean | void, () => void]> => {
      if (isApproved) {
        return startRent(items).then((status) => {
          return Promise.resolve([status, handleClose]);
        });
      }
      return Promise.reject([
        false,
        () => {
          // do nothing
        },
      ]);
    },
    [handleClose, isApproved, startRent]
  );
  return (
    <Modal open={open} handleClose={handleClose}>
      {open && <RentForm
        nfts={nft}
        handleApproveAll={handleApproveAll}
        isApproved={isApproved}
        handleSubmit={handleSubmit}
        isApprovalLoading={isApprovalLoading}
      ></RentForm>}
    </Modal>
  );
};

export default BatchRentModal;
