import React, { useEffect, useMemo, useState } from "react";

import { SECOND_IN_MILLISECONDS } from "renft-front/consts";
import { useDebounce } from "renft-front/hooks/misc/useDebounce";
import { useWallet } from "renft-front/hooks/store/useWallet";
import { NetworkName, TransactionHash, TransactionStateEnum } from "renft-front/types";

import {
  PendingTransactionsLoader
} from "./pending-transactions-loader";

export const TransactionWrapper: React.FC<{
  isLoading: boolean;
  transactionHashes?: TransactionHash[];
  status: TransactionStateEnum;
  closeWindow?: () => void | undefined;
}> = ({ isLoading, children, transactionHashes, status, closeWindow }) => {
  const { network } = useWallet();
  const transactionLoading = useDebounce(isLoading, 2 * SECOND_IN_MILLISECONDS);
  const [showMessage, setShowMessage] = useState(false);

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

  const etherScanUrl = useMemo(() => {
    if (network === NetworkName.ropsten) {
      return "https://ropsten.etherscan.io/tx";
    }
    return "https://etherscan.io/tx";
  }, [network]);

  return (
    <>
      {transactionLoading ? (
        <div className="block text-center" data-cy="transaction-loading">
          <PendingTransactionsLoader status={status} />
          {transactionHashes?.map((hash) => {
            return (
              <a
                key={hash}
                className="text-xl block"
                href={`${etherScanUrl}/${hash}`}
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
          {showMessage ? (
            <PendingTransactionsLoader status={status} />
          ) : (
            <>{children}</>
          )}
        </div>
      )}
    </>
  );
};
