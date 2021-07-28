import React from "react";
import { useMint } from "../../hooks/useMint";
import { advanceTime } from "../../utils";

export const MintTokens = () => {
  const { mintE20 } = useMint();
  return (
    <>
      <button className="menu__item" onClick={() => mintE20(1)}>
        Mint WETH
      </button>
      <button className="menu__item" onClick={() => mintE20(2)}>
        Mint DAI
      </button>
      <button className="menu__item" onClick={() => mintE20(3)}>
        Mint USDC
      </button>
      <button className="menu__item" onClick={() => mintE20(4)}>
        Mint USDT
      </button>
      <button className="menu__item" onClick={() => mintE20(5)}>
        Mint TUSD
      </button>
      <button className="menu__item" onClick={() => advanceTime(24 * 60 * 60)}>
        Advance time
      </button>
    </>
  );
};
