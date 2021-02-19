import React, { useCallback, useState } from "react";
import { NftAndLendingId } from "../../types/index";

type RentButtonProps = {
  handleRent: (lending: NftAndLendingId) => void;
  nft: NftAndLendingId;
};

export const RentButton: React.FC<RentButtonProps> = ({ handleRent, nft }) => {
  const _handleRent = useCallback(() => {
    handleRent(nft);
  }, [handleRent, nft]);

  return (
    <span
      className="Nft__button"
      onClick={_handleRent}
      style={{ marginTop: "8px" }}
    >
      Rent now
    </span>
  );
};

export default RentButton;
