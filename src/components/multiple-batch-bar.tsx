import React from "react";
import { Button } from "./button";

type BatchBarProps = {
  onClaim(): void;
  onStopRent(): void;
  onStopLend(): void;
  claimsNumber: number;
  lendingNumber: number;
  rentingNumber: number;
};

export const MultipleBatchBar: React.FC<BatchBarProps> = ({
  onClaim,
  onStopRent,
  onStopLend,
  claimsNumber,
  lendingNumber,
  rentingNumber,
}) => {

  if (rentingNumber < 1 && lendingNumber < 1 && claimsNumber < 1) return null;
  return (
    <div className="batch">
      {rentingNumber > 0 && (
        <div className="batch__inner">
          <div
            className="column"
            style={{ flexGrow: 1, fontSize: "20px", color: "#fff" }}
          >
            {`Selected ${rentingNumber} items to rent`}
          </div>
          <div className="column">
            <span style={{ width: "24px", display: "inline-flex" }} />

            <Button handleClick={onStopRent} description="Stop rent"></Button>
          </div>
        </div>
      )}
      {claimsNumber > 0 && (
        <div
          className="batch__inner"
          style={{ paddingTop: rentingNumber > 0 ? "20px" : "" }}
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
              description="Claim all"
            ></Button>
          </div>
        </div>
      )}
      {lendingNumber > 0 && (
        <div
          className="batch__inner"
          style={{
            paddingTop:
              claimsNumber > 0 || (claimsNumber < 1 && rentingNumber > 0)
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
