import React, { useCallback } from "react";
import { ERCNft } from "../../contexts/Graph/types";

type RentButtonProps = {
  handleRent: (lending: ERCNft) => void;
  nft: ERCNft;
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
