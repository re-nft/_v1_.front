import React from "react";
import { Button } from "./common/button";

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
    <div className="fixed bottom-0 left-0 right-0 w-full mx-auto z-10 px-4 bg-rn-purple  border-t-8 border-black">
      <div className="flex flex-col text-white text-xl space-y-4 py-4">
        {rentingNumber > 0 && (
          <div className="flex content-between items-center">
            <div>{`Selected ${rentingNumber} items to rent`}</div>
            <div className="flex-1 justify-end flex flex-row">
              <Button onClick={onStopRent} description="Return all" />
            </div>
          </div>
        )}
        {claimsNumber > 0 && (
          <div className="flex content-between items-center ">
            <div>{`Selected ${claimsNumber} items to claim`}</div>
            <div className="flex-1 justify-end flex flex-row">
              <Button onClick={onClaim} description="Claim all" />
            </div>
          </div>
        )}
        {lendingNumber - claimsNumber > 0 && (
          <div className="flex content-between items-center ">
            <div>
              {`Selected ${lendingNumber - claimsNumber} items to stop lend`}
            </div>
            <div className="flex-1 justify-end flex flex-row">
              <Button onClick={onStopLend} description="Stop lend all"></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultipleBatchBar;
