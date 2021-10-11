import React from "react";
import { useMint } from "renft-front/hooks/misc/useMint";
import { advanceTime } from "renft-front/utils";
import { Button } from "renft-front/components/common/button";

export const MintTokens: React.FC = () => {
  const { mintE20 } = useMint();
  return (
    <>
      <Button onClick={() => mintE20(1)} description="Mint WETH"></Button>
      <Button onClick={() => mintE20(2)} description="Mint DAI"></Button>
      <Button onClick={() => mintE20(3)} description="Mint USDC"></Button>
      <Button onClick={() => mintE20(4)} description="Mint USDT"></Button>
      <Button onClick={() => mintE20(5)} description="Mint TUSD"></Button>
      <Button
        onClick={() => advanceTime(24 * 60 * 60)}
        description="Advance time"
      ></Button>
    </>
  );
};
