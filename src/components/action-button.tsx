import React, { useCallback } from "react";
import { ERCNft } from "../contexts/Graph/types";

type NFT = {
  contract?: ERCNft["contract"];
  tokenId?: ERCNft["tokenId"];
};

type ActionButtonProps = {
  nft: NFT;
  title: string;
  onClick: (lending: NFT) => void;
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
