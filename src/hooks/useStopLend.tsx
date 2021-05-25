import { useCallback, useContext } from "react";
import { ReNFT } from "@renft/sdk";
import { ContractTransaction } from "@ethersproject/contracts";
import { Signer } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
import { UserLendingContext } from "../contexts/UserLending";

export const useStopLend = (): ((
  signer: Signer,
  nfts: {
    address: string;
    tokenId: string;
    amount: string;
    lendingId: string;
  }[]
) => Promise<void | ContractTransaction>) => {
  const { refetchLending } = useContext(UserLendingContext);
  
  return useCallback(
    (
      signer,
      nfts: {
        address: string;
        tokenId: string;
        amount: string;
        lendingId: string;
      }[]
    ) => {
      return new ReNFT(signer)
        .stopLending(
          nfts.map((nft) => (nft.address)),
          nfts.map((nft) => (BigNumber.from(nft.tokenId))),
          nfts.map((nft) => (Number(nft.amount))),
          nfts.map((nft) => (BigNumber.from(nft.lendingId)))
        )
        .then(() => {
          refetchLending();
        });
    },
    [refetchLending]
  );
};
