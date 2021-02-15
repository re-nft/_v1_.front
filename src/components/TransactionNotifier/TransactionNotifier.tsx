import React, { useContext, useEffect } from "react";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import DoneOutlineIcon from "@material-ui/icons/DoneOutline";
import Slide from "@material-ui/core/Slide";

import Spinner from "../Spinner";
import { TransactionStateContext } from "../../contexts/TransactionState";
import { TransactionStateEnum } from "../../types";

export const TransactionNotifier: React.FC = () => {
  const { hash, isActive, txnState } = useContext(TransactionStateContext);

  useEffect(() => {
    true;
    // force re-render on txnState change
  }, [txnState]);

  return (
    <Slide direction="up" in={isActive} mountOnEnter unmountOnExit>
      <div
        style={{
          position: "fixed",
          right: "0",
          top: "0",
          zIndex: 1,
          marginTop: "4em",
          marginRight: "4em",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              position: "absolute",
              left: "0",
              color: "teal",
            }}
          >
            {txnState === TransactionStateEnum.PENDING && <Spinner />}
            {txnState === TransactionStateEnum.FAILED && (
              <ErrorOutlineIcon fontSize="large" />
            )}
            {txnState === TransactionStateEnum.SUCCESS && (
              <DoneOutlineIcon fontSize="large" />
            )}
          </div>
          <a
            style={{
              color: "teal",
              fontSize: "24px",
              marginLeft: "2em",
            }}
            href={`https://etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
          >
            {TransactionStateEnum[txnState]}
          </a>
        </div>
      </div>
    </Slide>
  );
};

export default TransactionNotifier;
