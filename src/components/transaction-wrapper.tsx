import React, { useEffect, useMemo, useState } from "react";
import { SECOND_IN_MILLISECONDS } from "../consts";
import { useDebounce } from "../hooks/useDebounce";
import { TransactionHash, TransactionStateEnum } from "../types";

const IMAGE_PENDING = "/assets/loading-pending.gif";
const IMAGE_SUCCESS = "/assets/loading-success.png";
const IMAGE_FAILURE = "/assets/loading-failed.png";

export const TransactionWrapper: React.FC<{
  isLoading: boolean;
  transactionHashes?: TransactionHash[];
  status: TransactionStateEnum;
  closeWindow?: () => void | undefined;
}> = ({ isLoading, children, transactionHashes, status, closeWindow }) => {
  const transactionLoading = useDebounce(isLoading, 2 * SECOND_IN_MILLISECONDS)
  const [showMessage, setShowMessage] = useState(false);
  const imageSource = useMemo(() => {
    switch (status) {
      case TransactionStateEnum.FAILED:
        return IMAGE_FAILURE;
      case TransactionStateEnum.SUCCESS:
        return IMAGE_SUCCESS;
      case TransactionStateEnum.PENDING:
        return IMAGE_PENDING;
    }
  }, [status]);
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isLoading) return;
    if (
      status === TransactionStateEnum.FAILED ||
      status === TransactionStateEnum.SUCCESS
    ) {
      setShowMessage(true);
      timeout = setTimeout(() => {
        if (status === TransactionStateEnum.FAILED) {
          setShowMessage(false);
        } else if (status === TransactionStateEnum.SUCCESS) {
          if (closeWindow) closeWindow();
        }
      }, 2 * SECOND_IN_MILLISECONDS);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [closeWindow, isLoading, status]);

  return (
    <>
      {transactionLoading ? (
        <div style={{ display: "block" }} data-cy='transaction-loading'>
          <img src={imageSource}></img>
          {transactionHashes?.map((hash) => {
            return (
              <a
                key={hash}
                style={{ fontSize: "24px", display: "block" }}
                href={`https://etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noreferrer"
              >
                view transaction in explorer
              </a>
            );
          })}
        </div>
      ) : (
        <div>
          {showMessage ? <img src={imageSource}></img> : <>{children}</>}
        </div>
      )}
    </>
  );
};
