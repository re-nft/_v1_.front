import React from "react";

import { Nft } from "renft-front/types/classes";
import { CatalogueItemRow } from "renft-front/components/catalogue-item/catalogue-item-row";
import { ShortenPopover } from "renft-front/components/common/shorten-popover";

export type CommonInfoProps = {
  nft: Pick<Nft, 'nftAddress' | "tokenId" | "id" | "isERC721">;
};

const ModalFields: React.FC<CommonInfoProps> = ({ children, nft }) => {
  return (
    <div
      className="flex-col font-body text-xl leading-tight px-2 space-y-2"
      key={nft.id}
    >
      <CatalogueItemRow
        text={nft.isERC721 ? "721" : "1155"}
        value={<ShortenPopover longString={nft.nftAddress} />}
      />
      <CatalogueItemRow
        text={"Token Id"}
        value={<ShortenPopover longString={nft.tokenId} />}
      />
      {children}
    </div>
  );
};

export default ModalFields;
