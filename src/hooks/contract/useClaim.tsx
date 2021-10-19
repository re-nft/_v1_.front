import { BigNumber } from "ethers";
import { useCallback } from "react";
import { Lending } from "../../contexts/graph/classes";
import { sortNfts } from "../../utils";
import createDebugger from "debug";
import { useSDK } from "./useSDK";
import {
  TransactionStatus,
  useTransactionWrapper,
} from "../useTransactionWrapper";
import { EMPTY, Observable } from "rxjs";
//@ts-ignore
import { NFTStandard } from "@eenagy/sdk";

const debug = createDebugger("app:contracts:useClaimColleteral");

export const useClaim = (): ((
  nfts: Lending[]
) => Observable<TransactionStatus>) => {
  const transactionWrapper = useTransactionWrapper();
  const sdk = useSDK();

  return useCallback(
    (nfts: Lending[]) => {
      if (!sdk) {
        debug("SDK not found");
        return EMPTY;
      }
      const sortedNfts = nfts.sort(sortNfts);
      const params: [NFTStandard[], string[], BigNumber[], BigNumber[], BigNumber[]] = [
        sortedNfts.map((nft) => nft.isERC721 ? NFTStandard.E721 : NFTStandard.E1155),
        sortedNfts.map((nft) => nft.address),
        sortedNfts.map((nft) => BigNumber.from(nft.tokenId)),
        sortedNfts.map((nft) => BigNumber.from(nft.renting?.lendingId)),
        sortedNfts.map((nft) => BigNumber.from(nft.renting?.id)),
      ];
      debug(
        "Claim modal addresses ",
        sortedNfts.map((nft) => nft.address)
      );
      debug(
        "Claim modal tokenId ",
        sortedNfts.map((nft) => nft.tokenId)
      );
      debug(
        "Claim modal lendingId ",
        sortedNfts.map((nft) => nft.renting?.lendingId)
      );
      return transactionWrapper(sdk.claimRent(...params), {
        action: "claim",
        label: `
        Claim modal standardss : ${sortedNfts.map((nft) => nft.isERC721 ? NFTStandard.E721 : NFTStandard.E1155)}
        Claim modal addresses : ${sortedNfts.map((nft) => nft.address)}
        Claim modal tokenId: ${sortedNfts.map((nft) => nft.tokenId)}
        Claim modal lendingIds: ${sortedNfts.map(
          (nft) => nft.renting?.lendingId
        )}
        Claim model rentindIds ${sortedNfts.map((nft) => BigNumber.from(nft.renting?.id))}
        `,
      });
    },
    [sdk, transactionWrapper]
  );
};
