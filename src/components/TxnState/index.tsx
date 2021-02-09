import React from "react";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import DoneOutlineIcon from "@material-ui/icons/DoneOutline";
import Slide from "@material-ui/core/Slide";

import Spinner from "../Spinner";
import { TransactionState } from "../../types";

type TxnStateProps = {
  state?: TransactionState;
  txnHash: string;
};

const TxnState: React.FC<TxnStateProps> = ({
  state = TransactionState.PENDING,
  txnHash,
}) => {
  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
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
            }}
          >
            {state === TransactionState.PENDING && <Spinner />}
            {state === TransactionState.FAILED && (
              <ErrorOutlineIcon fontSize="large" />
            )}
            {state === TransactionState.SUCCESS && (
              <DoneOutlineIcon fontSize="large" />
            )}
          </div>
          <a
            style={{
              color: "black",
              fontSize: "24px",
              marginLeft: "2em",
            }}
            href="https://etherscan.io/tx/0xaeacf8817b1cab4414caf024264e4005957de58b1415b4dd3a500dfb69306f44"
            target="_blank"
            rel="noreferrer"
          >
            {TransactionState[state]}
          </a>
        </div>
      </div>
    </Slide>
  );
};

export default TxnState;
