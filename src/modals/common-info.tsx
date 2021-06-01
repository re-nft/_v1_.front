import React from "react";
import { Address } from "../components/address";

import { Nft } from "../contexts/graph/classes";
import { getUniqueID } from "../controller/batch-controller";

export type CommonInfoProps = {
  nft: Nft;
};

const CommonInfo: React.FC<CommonInfoProps> = ({ children, nft }) => {
  return (
    <div
      className="modal-dialog-section"
      key={getUniqueID(nft.address, nft.tokenId)}
    >
      <div className="modal-dialog-for">
        <div className="label">{nft.isERC721 ? "721" : "1155"}</div>
      </div>
      <div className="modal-dialog-for">
        <div className="label">
          <Address address={nft.address}></Address>
        </div>
      </div>
      <div className="modal-dialog-for">
        <div className="label">Token Id</div>
        <div className="dot"></div>
        <div className="label">{nft.tokenId}</div>
      </div>
      <div className="modal-dialog-for">
        <div className="label">Available Amount</div>
        <div className="dot"></div>
        {/* we can do this because checked items will have the right amount when we pass them here */}
        <div className="label">{nft.amount}</div>
      </div>
      <div className="modal-dialog-fields">{children}</div>
    </div>
  );
};

export default CommonInfo;
