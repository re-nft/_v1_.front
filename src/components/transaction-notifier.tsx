import React, { useContext, useMemo } from "react";
import Slide from "@material-ui/core/Slide";

import { TransactionStateContext } from "../contexts/TransactionState";
import { TransactionStateEnum } from "../types";

export const TransactionNotifier: React.FC = () => {
  const { hash, isActive, txnState } = useContext(TransactionStateContext);
  const isFailed = useMemo(() => {
    return txnState === TransactionStateEnum.FAILED
  }, [txnState])

  const isSuccess = useMemo(() => {
    return txnState === TransactionStateEnum.SUCCESS
  }, [txnState])

  return (
    <Slide direction="up" in={isActive} mountOnEnter unmountOnExit>
      <div className="notifier">
        {/* {txnState === TransactionStateEnum.PENDING && <Loader />} */}
        {isFailed && (
          <div className="notifier-failed"></div>
        )}
        {isSuccess && (
          <div className="notifier-success"></div>
        )}
        <a
          style={{ color: "#fff", fontSize: "24px" }}
          href={`https://etherscan.io/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
        >
          {TransactionStateEnum[txnState]}
        </a>
      </div>
    </Slide>
  );
};

export default TransactionNotifier;
