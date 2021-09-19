import React from "react";
import { useMint } from "../../hooks/misc/useMint";
import { Button } from "../common/button";

export const MintNfts: React.FC = () => {
  const { mintNFT } = useMint();
  return (
    <>
      <Button onClick={() => mintNFT(0)} description="Mint 721A"></Button>
      <Button onClick={() => mintNFT(1)} description="Mint 721B"></Button>
      <Button onClick={() => mintNFT(2)} description="Mint 1155"></Button>
      <Button onClick={() => mintNFT(3)} description="Mint 1155B"></Button>
    </>
  );
};
