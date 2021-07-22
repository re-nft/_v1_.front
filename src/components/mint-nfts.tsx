import React from "react";
import { useMint } from "../hooks/useMint";

export const MintNfts = () => {
  const { mintNFT } = useMint();
  return (
    <>
      <button className="menu__item" onClick={() => mintNFT(0)}>
        Mint 721A
      </button>
      <button className="menu__item" onClick={() => mintNFT(1)}>
        Mint 721B
      </button>
      <button className="menu__item" onClick={() => mintNFT(2)}>
        Mint 1155A
      </button>
      <button className="menu__item" onClick={() => mintNFT(3)}>
        Mint 1155B
      </button>
    </>
  );
};
