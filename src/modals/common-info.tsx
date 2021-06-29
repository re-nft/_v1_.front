import React from "react";
import { ShortenPopover } from "../components/shorten-popover";

import { Nft } from "../contexts/graph/classes";
import { getUniqueCheckboxId } from "../controller/batch-controller";

export type CommonInfoProps = {
  nft: Nft;
};

const CommonInfo: React.FC<CommonInfoProps> = ({ children, nft }) => {
  return (
    <div className="modal-dialog-section" key={getUniqueCheckboxId(nft)}>
      <div className="modal-dialog-for">
        <div className="label">{nft.isERC721 ? "721" : "1155"}</div>
      </div>
      <div className="modal-dialog-for">
        <div className="label">
          <ShortenPopover longString={nft.address}></ShortenPopover>
        </div>
      </div>
      <div className="modal-dialog-for">
        <div className="label">Token Id</div>
        <div className="dot"></div>
        <div className="label">{nft.tokenId}</div>
      </div>
      <div className="modal-dialog-fields">{children}</div>
    </div>
  );
};

export default CommonInfo;
