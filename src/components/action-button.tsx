import React, { useCallback } from "react";
import { ERCNft } from "../contexts/Graph/types";

type ActionButtonProps = {
  nft: ERCNft;
  title: string;
  onClick: (lending: ERCNft) => void;
};

const ActionButton: React.FC<ActionButtonProps> = ({ nft, title, onClick }) => {
  const onClickHandler = useCallback(() => {
    onClick(nft);
  }, [onClick, nft]);

  return (
    <div className="Nft__card">
      <span className="Nft__button" onClick={onClickHandler}>
        {title}
      </span>
    </div>
  );
};

export default ActionButton;
