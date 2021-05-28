import { useCallback, useContext, useMemo } from "react";
import { ContractTransaction } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import { getReNFT } from "../services/get-renft-instance";
import createDebugger from "debug";
import { SignerContext } from "../hardhat/SymfoniContext";
import { useContractAddress } from "../contexts/StateProvider";

const debug = createDebugger('app:contracts:usestoplend')

export const useStopLend = (): ((
  nfts: {
    address: string;
    tokenId: string;
    lendingId: string;
  }[]
) => Promise<void | ContractTransaction>) => {
  const [signer]= useContext(SignerContext);
  const contractAddress = useContractAddress()

  const renft = useMemo(() => {
    if (!signer) return;
    return getReNFT(signer, contractAddress);
  }, [signer, contractAddress]);
  
  return useCallback(
    (
      nfts: {
        address: string;
        tokenId: string;
        lendingId: string;
      }[]
    ) => {
      if (!renft) return Promise.resolve();
      const arr: [string[], BigNumber[], BigNumber[]] = [
        nfts.map((nft) => nft.address),
        nfts.map((nft) => BigNumber.from(nft.tokenId)),
        nfts.map((nft) => BigNumber.from(nft.lendingId)),
      ];
      return renft.stopLending(...arr).catch(() => {
        debug("could not stop lending. maybe someone is renting this nft.");
        return;
      });
    },
    [renft]
  );
};
