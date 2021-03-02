import React, { useCallback, useState } from "react";
import { NftAndLendRentInfo } from "../../types/index";

type RentButtonProps = {
  handleRent: (lending: NftAndLendRentInfo) => void;
  nft: NftAndLendRentInfo;
};

export const RentButton: React.FC<RentButtonProps> = ({ handleRent, nft }) => {
  const _handleRent = useCallback(() => {
    handleRent(nft);
  }, [handleRent, nft]);

  return (
    <div className="Nft__card">
      <span
        className="Nft__button"
        onClick={_handleRent}
        style={{ marginTop: "8px" }}
      >
        Rent now
      </span>
    </div>
  );
};

export default RentButton;
