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
        className="TransactionNotifier"
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          zIndex: 9999,
          marginTop: "-110px",
          marginLeft: "-90px",
          background: "rgb(85, 0, 153)",
          border: "3px solid #000",
          padding: "40px",
        }}
      >
        <div>
          <div
            style={{
              position: "relative",
              top: "0",
              color: "teal",
              paddingBottom: "100px",
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
            style={{ color: "teal", fontSize: "24px" }}
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
