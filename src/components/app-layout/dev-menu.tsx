import React from "react";
import { MintNfts } from "../dev/mint-nfts";
import { MintTokens } from "../dev/mint-token";

export const DevMenu: React.FC = () => {
  const showMint = process.env.NEXT_PUBLIC_SHOW_MINT === "true";
  return (
    showMint ? (
      <div className='content-wrapper mb-l' style={{flexWrap: "wrap"}}>
        <MintNfts />
        <MintTokens />
      </div>
    ): null
  );
};
