 import { BigNumber } from "ethers";
import { useCallback } from "react";
import { Lending } from "../../types/classes";
import { sortNfts } from "../../utils";
import createDebugger from "debug";
import { useSDK } from "./useSDK";
import {
  TransactionStatus,
  useTransactionWrapper,
} from "../useTransactionWrapper";
import { EMPTY, Observable } from "rxjs";

const debug = createDebugger("app:contracts:useClaimcollateral");

export const useClaimcollateral = (): ((
  lendings: Lending[]
) => Observable<TransactionStatus>) => {
  const transactionWrapper = useTransactionWrapper();
  const sdk = useSDK();

  return useCallback(
    (lendings: Lending[]) => {
      if (!sdk) {
        debug("SDK not found");
        return EMPTY;
      }
      const sortedNfts = lendings.sort(sortNfts);
      const params: [string[], BigNumber[], BigNumber[]] = [
        sortedNfts.map((lending) => lending.nftAddress),
        sortedNfts.map((lending) => BigNumber.from(lending.tokenId)),
        sortedNfts.map((lending) => BigNumber.from(lending.id)),
      ];
      debug(
        "Claim modal addresses ",
        sortedNfts.map((lending) => lending.nftAddress)
      );
      debug(
        "Claim modal tokenId ",
        sortedNfts.map((lending) => lending.tokenId)
      );
      debug(
        "Claim modal lendingId ",
        sortedNfts.map((lending) => lending.id)
      );
      return transactionWrapper(sdk.claimCollateral(...params), {
        action: "claim",
        label: `Claim modal addresses : ${sortedNfts.map((lending) => lending.nftAddress)}
        Claim modal tokenId: ${sortedNfts.map((lending) => lending.tokenId)}
        Claim modal lendingIds: ${sortedNfts.map(
          (lending) => lending.id
        )}
        `,
      });
    },
    [sdk, transactionWrapper]
  );
};
