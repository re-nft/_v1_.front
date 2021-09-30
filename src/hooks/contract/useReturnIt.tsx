import { BigNumber } from "ethers";
import { useCallback } from "react";
import { Renting } from "../../types/classes";
import { sortNfts } from "../../utils";
import { useSDK } from "./useSDK";
import {
  SmartContractEventType,
  TransactionStatus,
} from "../store/useEventTrackedTransactions";
import { useCreateRequest } from "../store/useCreateRequest";

export const useReturnIt = (): {
  returnIt: (rentings: Renting[]) => void;
  status: TransactionStatus;
} => {
  const sdk = useSDK();
  const { createRequest, status } = useCreateRequest();

  const returnIt = useCallback(
    (rentings: Renting[]) => {
      if (!sdk) return false;
      if (rentings.length < 1) return false;
      const sortedNfts = rentings.sort(sortNfts);
      createRequest(
        sdk.returnIt(
          sortedNfts.map((renting) => renting.nftAddress),
          sortedNfts.map((renting) => BigNumber.from(renting.tokenId)),
          sortedNfts.map((renting) => BigNumber.from(renting.lendingId))
        ),
        {
          action: "Return nft",
          label: `
          addresses: ${sortedNfts.map((renting) => renting.nftAddress)}
          tokenIds: ${sortedNfts.map((renting) =>
            BigNumber.from(renting.tokenId)
          )}
          lendingIds: ${sortedNfts.map((renting) =>
            BigNumber.from(renting.lendingId)
          )}
        `
        },
        {
          ids: rentings.map((l) => l.id),
          type: SmartContractEventType.RETURN_RENTAL
        }

      );
    },
    [sdk, createRequest]
  );
  return { returnIt, status };
};
