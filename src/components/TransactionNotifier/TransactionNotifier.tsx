import React, { useContext, useMemo } from "react";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import DoneOutlineIcon from "@material-ui/icons/DoneOutline";
import Slide from "@material-ui/core/Slide";

import Spinner from "../Spinner";
import { TransactionStateContext } from "../../contexts/TransactionState";
import { TransactionState } from "../../types";

const SECOND_IN_MILLISECONDS = 1_000;

type TransactionNotifierProps = {
  state?: TransactionState;
};

export const TransactionNotifier: React.FC<TransactionNotifierProps> = ({
  state = TransactionState.PENDING,
}) => {
  const { hash, isActive } = useContext(TransactionStateContext);

  // delayed slide off
  const _in = useMemo(() => {
    if (isActive) return isActive;
    setTimeout(() => {
      true;
    }, 5 * SECOND_IN_MILLISECONDS);
    return false;
  }, [isActive]);

  return (
    <Slide direction="up" in={_in} mountOnEnter unmountOnExit>
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
            href={`https://etherscan.io/tx/${hash}`}
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

export default TransactionNotifier;
