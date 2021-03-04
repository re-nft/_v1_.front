import React, { useCallback } from "react";
import { Nft } from "../../contexts/graph/classes";

type ActionButtonProps = {
  nft: Nft;
  title: string;
  onClick: (lending: Nft) => void;
};

const ActionButton: React.FC<ActionButtonProps> = ({ nft, title, onClick }) => {
  const onClickHandler = useCallback(() => {
    onClick(nft);
  }, [onClick, nft]);

  return (
    <div className="Nft__card" style={{ marginTop: "8px" }}>
      <div className="Nft__card">
        <span className="Nft__button" onClick={onClickHandler}>
        {title}
        </span>
      </div>
    </div>
  );
};

export default ActionButton;
