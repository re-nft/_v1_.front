import { BigNumber } from "@ethersproject/bignumber";
import { useCallback } from "react";
import { Lending } from "renft-front/types/classes";
import { sortNfts } from "renft-front/utils";
import createDebugger from "debug";
import { useSDK } from "renft-front/hooks/contract/useSDK";
import {
  SmartContractEventType,
  TransactionStatus,
} from "renft-front/hooks/store/useEventTrackedTransactions";
import { useCreateRequest } from "renft-front/hooks/store/useCreateRequest";

const debug = createDebugger("app:contracts:useClaimcollateral");

export const useClaimcollateral = (): {
  claim: (lendings: Lending[]) => void;
  status: TransactionStatus;
} => {
  const { createRequest, status } = useCreateRequest();

  const sdk = useSDK();

  const claim = useCallback(
    (lendings: Lending[]) => {
      if (!sdk) return;
      if (lendings == null) return;
      if (lendings.length < 1) return;

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
      createRequest(
        () => sdk.claimCollateral(...params),
        {
          action: "claim",
          label: `Claim modal addresses : ${sortedNfts.map(
            (lending) => lending.nftAddress
          )}
        Claim modal tokenId: ${sortedNfts.map((lending) => lending.tokenId)}
        Claim modal lendingIds: ${sortedNfts.map((lending) => lending.id)}
        `,
        },
        {
          ids: lendings.map((l) => l.id),
          type: SmartContractEventType.CLAIM,
        }
      );
    },
    [sdk, createRequest]
  );

  return { claim, status };
};
