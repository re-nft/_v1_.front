import React, { useCallback, useContext, useState } from "react";

import { ProviderContext } from "../../hardhat/SymfoniContext";
import { TransactionStateContext } from "../../contexts/TransactionState";
import { Nft } from "../../types";

import {
  RentNftContext,
  CurrentAddressContext,
} from "../../hardhat/SymfoniContext";

type ApproveButtonProps = {
  nft: Nft;
  callback?: () => void;
};

export const ApproveButton: React.FC<ApproveButtonProps> = ({
  nft,
  callback,
}) => {
  const [currentAddress] = useContext(CurrentAddressContext);
  const [provider] = useContext(ProviderContext);
  const { instance: renft } = useContext(RentNftContext);
  const { setHash, isActive } = useContext(TransactionStateContext);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  const handleApproveAll = useCallback(async () => {
    if (!currentAddress || !renft || isActive || !nft.contract || !provider)
      return;
    const tx = await nft.contract.setApprovalForAll(renft.address, true);
    // do not await, call and release
    setHash(tx.hash);
    const receipt = await provider.getTransactionReceipt(tx.hash);
    const status = receipt.status ?? 0;
    if (status === 1) {
      setIsApproved(true);
      if (callback) callback();
    }
  }, [
    currentAddress,
    renft,
    nft.contract,
    isActive,
    setHash,
    provider,
    callback,
  ]);

  if (isApproved) {
    return <></>;
  }

  return (
    <button
      type="button"
      style={{
        border: "3px solid black",
      }}
      className="Navigation__button"
      onClick={handleApproveAll}
    >
      Approve all
    </button>
  );
};

export default ApproveButton;
