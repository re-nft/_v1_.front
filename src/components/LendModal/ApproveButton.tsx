import React, { useCallback, useContext } from "react";

import { TransactionStateContext } from "../../contexts/TransactionState";
import { Nft } from "../../types";

import {
  RentNftContext,
  CurrentAddressContext,
} from "../../hardhat/SymfoniContext";

type ApproveButtonProps = {
  nft: Nft;
};

export const ApproveButton: React.FC<ApproveButtonProps> = ({ nft }) => {
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);
  const { setHash, isActive } = useContext(TransactionStateContext);

  const handleApproveAll = useCallback(async () => {
    if (!currentAddress || !renft || isActive || !nft.contract) return;
    const tx = await nft.contract.setApprovalForAll(renft.address, true);
    // do not await, call and release
    setHash(tx.hash);
  }, [currentAddress, renft, nft.contract, isActive, setHash]);

  return (
    <button
      type="button"
      style={{
        border: "3px solid black",
      }}
      className="Product__button"
      onClick={handleApproveAll}
    >
      Approve all
    </button>
  );
};

export default ApproveButton;
