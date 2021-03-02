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
