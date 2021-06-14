import React, { useCallback, useContext, useEffect, useState } from "react";
import createCancellablePromise from "../contexts/create-cancellable-promise";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import { Nft, Renting } from "../contexts/graph/classes";
import { SnackAlertContext } from "../contexts/SnackProvider";
import { useContractAddress } from "../contexts/StateProvider";
import TransactionStateContext from "../contexts/TransactionState";
import UserContext from "../contexts/UserProvider";
import isApprovalForAll from "../services/is-approval-for-all";
import setApprovalForAll from "../services/set-approval-for-all";
import { Button } from "./button";

type BatchBarProps = {
  onClaim(): void;
  onStopRent(): void;
  onStopLend(): void;
  claimsNumber: number;
  lendingNumber: number;
  rentingNumber: number;
  checkedRenting: Renting[];
};

export const MultipleBatchBar: React.FC<BatchBarProps> = ({
  onClaim,
  onStopRent,
  onStopLend,
  claimsNumber,
  lendingNumber,
  rentingNumber,
  checkedRenting,
}) => {
  const { setHash } = useContext(TransactionStateContext);
  const contractAddress = useContractAddress();
  const currentAddress = useContext(CurrentAddressWrapper);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isApprovalLoading, setIsApprovalLoading] = useState<boolean>(false);
  const [nonApprovedNft, setNonApprovedNfts] = useState<Nft[]>([]);
  const {web3Provider:provider} = useContext(UserContext);
  const { setError } = useContext(SnackAlertContext);

  useEffect(() => {
    if (!currentAddress) return;
    setIsApproved(false);
    const transaction = createCancellablePromise(
      isApprovalForAll(checkedRenting, currentAddress, contractAddress)
    );
    transaction.promise
      .then(([isApproved, nonApproved]) => {
        if (isApproved) setIsApproved(isApproved);
        setNonApprovedNfts(nonApproved);
      })
      .catch(() => {
        console.warn("batch lend issue with is approval for all");
      });
    return transaction.cancel;
  }, [currentAddress, setIsApproved, contractAddress, checkedRenting]);

  const handleApproveAll = useCallback(() => {
    if (!provider) return;
    const transaction = createCancellablePromise(
      setApprovalForAll(nonApprovedNft, contractAddress)
    );
    setIsApproved(false);
    setIsApprovalLoading(true);
    transaction.promise
      .then((hashes) => {
        if (hashes.length < 1) return Promise.resolve(false);
        return setHash(hashes.map((tx) => tx.hash));
      })
      .then((status) => {
        if (!status) setError("Transaction is not successful!", "warning");
        setIsApproved(status);
        setIsApprovalLoading(false);
      })
      .catch((e) => {
        console.warn("issue approving all in batch lend");
        setError(e.message, "error");
        setIsApprovalLoading(false);
        return [undefined];
      });

    return () => {
      transaction.cancel();
    };
  }, [contractAddress, nonApprovedNft, provider, setError, setHash]);

  if (rentingNumber < 2 && lendingNumber < 2 && claimsNumber < 2) return null;
  return (
    <div className="batch">
      {rentingNumber > 1 && (
        <div className="batch__inner">
          <div
            className="column"
            style={{ flexGrow: 1, fontSize: "20px", color: "#fff" }}
          >
            {`Selected ${rentingNumber} items to rent`}
          </div>
          <div className="column">
            <span style={{ width: "24px", display: "inline-flex" }} />
            {!isApproved && (
              <Button
                handleClick={handleApproveAll}
                description="Approve return"
                disabled={isApprovalLoading}
              ></Button>
            )}
            {isApproved && (
              <Button handleClick={onStopRent} description="Stop rent"></Button>
            )}
          </div>
        </div>
      )}
      {claimsNumber > 1 && (
        <div
          className="batch__inner"
          style={{ paddingTop: rentingNumber > 1 ? "20px" : "" }}
        >
          <div
            className="column"
            style={{ flexGrow: 1, fontSize: "20px", color: "#fff" }}
          >
            {`Selected ${claimsNumber} items to claim`}
          </div>
          <div className="column">
            <span style={{ width: "24px", display: "inline-flex" }} />
            <Button
              handleClick={onClaim}
              disabled={isApprovalLoading}
              description="Claim all"
            ></Button>
          </div>
        </div>
      )}
      {lendingNumber > 1 && (
        <div
          className="batch__inner"
          style={{
            paddingTop:
              claimsNumber > 1 || (claimsNumber < 2 && rentingNumber > 1)
                ? "20px"
                : "",
          }}
        >
          <div
            className="column"
            style={{ flexGrow: 1, fontSize: "20px", color: "#fff" }}
          >
            {`Selected ${lendingNumber} items to lend`}
          </div>
          <div className="column">
            <span style={{ width: "24px", display: "inline-flex" }} />
            <Button
              handleClick={onStopLend}
              description="Stop lend all"
            ></Button>

          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleBatchBar;
