import React from "react";
import { CopyLink } from "renft-front/components/copy-link";
import Checkbox from "renft-front/components/common/checkbox";
import { ReactEventOnChangeType } from "renft-front/types";

export const CatalogueActions: React.FC<{
  nftAddress: string;
  tokenId: string;
  id: string,
  checked: boolean;
  onCheckboxChange: ReactEventOnChangeType;
  disabled?: boolean;
}> = ({ nftAddress, tokenId, checked, onCheckboxChange, disabled, id }) => {
  return (
    <div className="flex flex-auto flex-row space-x-1 content-evenly p-1">
      <div className="flex-1 flex space-x-1 items-center">
      </div>

      <div className="flex-1 flex justify-center items-center pl-3">
        <CopyLink address={nftAddress} tokenId={tokenId}></CopyLink>
      </div>
      <div className="flex-1 flex justify-end items-center space-x-2 pr-2">
        <div>
          <Checkbox
            id={id}
            checked={checked}
            onChange={onCheckboxChange}
            disabled={disabled}
            label={`Toggle catalogue item ${id}`}
            ariaLabel={`Toggle catalogue item ${id}`}
          ></Checkbox>
        </div>
      </div>
    </div>
  );
};
