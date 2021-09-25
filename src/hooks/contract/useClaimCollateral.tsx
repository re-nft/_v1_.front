import { BigNumber } from "ethers";
import { useCallback } from "react";
import { Lending } from "../../types/classes";
import { sortNfts } from "../../utils";
import createDebugger from "debug";
import { useSDK } from "./useSDK";
import { SmartContractEventType, TransactionStatus } from "../misc/useEventTrackedTransactions";
import {
  useCreateRequest
} from "../misc/useCreateRequest";

const debug = createDebugger("app:contracts:useClaimcollateral");

export const useClaimcollateral = (): {
  claim: (lendings: Lending[]) => void;
  status: TransactionStatus;
} => {
  const { createRequest, status } = useCreateRequest();

  const sdk = useSDK();

  const claim = useCallback(
    (lendings: Lending[]) => {
      if (!sdk) {
        debug("SDK not found");
        return;
      }
      const sortedNfts = lendings.sort(sortNfts);
      const params: [string[], BigNumber[], BigNumber[]] = [
        sortedNfts.map((lending) => lending.nftAddress),
        sortedNfts.map((lending) => BigNumber.from(lending.tokenId)),
        sortedNfts.map((lending) => BigNumber.from(lending.id))
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
      createRequest(
        sdk.claimCollateral(...params),
        {
          action: "claim",
          label: `Claim modal addresses : ${sortedNfts.map(
            (lending) => lending.nftAddress
          )}
        Claim modal tokenId: ${sortedNfts.map((lending) => lending.tokenId)}
        Claim modal lendingIds: ${sortedNfts.map((lending) => lending.id)}
        `
        },
        {
          ids: lendings.map((l) => l.id),
          type: SmartContractEventType.CLAIM
        }
      );
    },
    [sdk, createRequest]
  );

  return { claim, status };
};
