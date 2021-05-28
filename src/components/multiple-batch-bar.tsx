import React from "react";

type BatchBarProps = {
  title: string;
  onClaim(): void;
  onStopRent(): void;
  onStopLend(): void;
  claimsNumber: number;
  lendingNumber: number;
  rentingNumber: number;
};

export const MultipleBatchBar: React.FC<BatchBarProps> = ({
  title,
  onClaim,
  onStopRent,
  onStopLend,
  claimsNumber,
  lendingNumber,
  rentingNumber,
}) => {
  if (rentingNumber < 2 && lendingNumber < 2) return null;
  return (
    <div className="batch">
      {rentingNumber > 1 && (
        <div className="batch__inner">
          <div
            className="column"
            style={{ flexGrow: 1, fontSize: "20px", color: "#fff" }}
          >
            {title}
          </div>
          <div className="column">
          
            <span style={{ width: "24px", display: "inline-flex" }} />
            <button className="nft__button" onClick={onStopRent}>
              Stop rent
            </button>
          </div>
        </div>
      )}
      {claimsNumber > 1 && (
        <div className="batch__inner" style={{ paddingTop: rentingNumber > 1 ? "20px" : '' }}>
          <div
            className="column"
            style={{ flexGrow: 1, fontSize: "20px", color: "#fff" }}
          >
            {title}
          </div>
          <div className="column">
        
            <span style={{ width: "24px", display: "inline-flex" }} />
            <button className="nft__button" onClick={onClaim}>
              Claim all
            </button>
          </div>
        </div>
      )}
      {lendingNumber > 1 && (
        <div className="batch__inner" style={{ paddingTop: claimsNumber > 1 ? "20px" : '' }}>
          <div
            className="column"
            style={{ flexGrow: 1, fontSize: "20px", color: "#fff" }}
          >
            {title}
          </div>
          <div className="column">
            <span style={{ width: "24px", display: "inline-flex" }} />
            <button className="nft__button" onClick={onStopLend}>
              Stop lend
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleBatchBar;
