import React, { useContext, useEffect } from "react";
import Slide from "@material-ui/core/Slide";

import Loader from "./loader";
import { TransactionStateContext } from "../contexts/TransactionState";
import { TransactionStateEnum } from "../types";

export const TransactionNotifier: React.FC = () => {
  const { hash, isActive, txnState } = useContext(TransactionStateContext);

  useEffect(() => {
    true;
    // force re-render on txnState change
  }, [txnState]);

  return (
    <Slide direction="up" in={isActive} mountOnEnter unmountOnExit>
      <div
        className="notifier">
          {txnState === TransactionStateEnum.PENDING && <Loader />}
          {txnState === TransactionStateEnum.FAILED && (
            <div className="notifier-failed"></div>
          )}
          {txnState === TransactionStateEnum.SUCCESS && (
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
