import { useCallback, useEffect, useState } from "react";

import { BigNumber } from "@ethersproject/bignumber";
import { Signer } from "@ethersproject/abstract-signer";
import { Nft } from "renft-front/types/classes";
import { usePrevious } from "renft-front/hooks/misc/usePrevious";
import { useSmartContracts } from "renft-front/hooks/contract/useSmartContracts";
import { useWallet } from "renft-front/hooks/store/useWallet";
import { useCurrentAddress } from "renft-front/hooks/misc/useCurrentAddress";
import shallow from "zustand/shallow";
import {
  OWNED_NFT_TYPE,
  useNftsStore,
} from "renft-front/hooks/store/useNftStore";
import {
  debounceTime,
  EMPTY,
  from,
  map,
  switchMap,
  timer,
  catchError,
  of,
} from "rxjs";
import { SECOND_IN_MILLISECONDS } from "renft-front/consts";
import { NetworkName } from "renft-front/types";
import {
  EventTrackedTransactionStateManager,
  SmartContractEventType,
  useEventTrackedTransactionState,
} from "renft-front/hooks/store/useEventTrackedTransactions";

export type CancellablePromise<T> = {
  promise: Promise<T>;
  cancel: () => void;
};

const BigNumZero = BigNumber.from("0");

function range(start: number, stop: number, step: number) {
  const a = [start];
  let b = start;
  while (b < stop) {
    a.push((b += step || 1));
  }
  return a;
}
//TODO:eniko refactor to rxjs
export const useFetchNftDev = (): { devNfts: Nft[]; isLoading: boolean } => {
  const currentAddress = useCurrentAddress();
  const { network, signer } = useWallet();
  const { E721, E721B, E1155, E1155B } = useSmartContracts();
  const [isLoading, setLoading] = useState(false);
  const devNfts = useNftsStore(
    useCallback((state) => {
      return state.dev_nfts.map((i) => state.nfts[i]);
    }, []),
    shallow
  );
  const refetchAfterOperation = useEventTrackedTransactionState(
    useCallback((state: EventTrackedTransactionStateManager) => {
      const pendingStopRentals =
        state.pendingTransactions[SmartContractEventType.STOP_LEND];
      const pendingLendings =
        state.pendingTransactions[SmartContractEventType.START_LEND];
      // refetch will change when you start renting goes from non-empty array to empty array
      return pendingLendings.length + pendingStopRentals.length;
    }, []),
    shallow
  );
  const previousAddress = usePrevious(currentAddress);
  const addNfts = useNftsStore(useCallback((state) => state.addNfts, []));
  const setAmount = useNftsStore(useCallback((state) => state.setAmount, []));

  const fetchDevNfts = useCallback(
    async (currentAddress: string, signer: Signer) => {
      if (typeof process.env.NEXT_PUBLIC_FETCH_NFTS_DEV === "undefined") {
        return [];
      }
      if (!E1155 || !E721 || !E721B || !E1155B) {
        return [];
      }
      const usersNfts: Nft[] = [];
      const E1155IDs = range(0, 1005, 1);
      const e721 = E721.connect(signer);
      const e721b = E721B.connect(signer);
      const e1155 = E1155.connect(signer);
      const e1155b = E1155B.connect(signer);
      const num721s = await e721
        .balanceOf(currentAddress)
        .catch(() => BigNumZero);

      const num721bs = await e721b
        .balanceOf(currentAddress)
        .catch(() => BigNumZero);

      const num1155s = await e1155

        .balanceOfBatch(Array(E1155IDs.length).fill(currentAddress), E1155IDs)
        .catch(() => []);

      const num1155bs = await e1155b

        .balanceOfBatch(Array(E1155IDs.length).fill(currentAddress), E1155IDs)
        .catch(() => []);

      for (let i = 0; i < num721s.toNumber(); i++) {
        try {
          const tokenId = await e721.tokenOfOwnerByIndex(
            currentAddress,
            String(i)
          );
          usersNfts.push(new Nft(e721.address, tokenId.toString(), true));
        } catch (e) {
          console.debug(
            "most likely tokenOfOwnerByIndex does not work. whatever, this is not important"
          );
        }
      }

      for (let i = 0; i < num721bs.toNumber(); i++) {
        try {
          const tokenId = await e721b.tokenOfOwnerByIndex(
            currentAddress,
            String(i)
          );
          usersNfts.push(new Nft(e721b.address, tokenId.toString(), true));
        } catch (e) {
          console.debug(
            "most likely tokenOfOwnerByIndex does not work. whatever, this is not important"
          );
        }
      }

      let amountBalance = await e1155.balanceOfBatch(
        Array(E1155IDs.length).fill(currentAddress),
        E1155IDs
      );

      for (let i = 0; i < num1155s.length; i++) {
        if (amountBalance[i].toNumber() > 0) {
          const nft = new Nft(e1155.address, E1155IDs[i].toString(), false);
          setAmount(nft.nId, Number(amountBalance[i].toString()));
          usersNfts.push(nft);
        }
      }

      amountBalance = await e1155b.balanceOfBatch(
        Array(E1155IDs.length).fill(currentAddress),
        E1155IDs
      );

      for (let i = 0; i < num1155bs.length; i++) {
        if (amountBalance[i].toNumber() > 0) {
          const nft = new Nft(e1155b.address, E1155IDs[i].toString(), false);
          setAmount(nft.nId, Number(amountBalance[i].toString()));
          usersNfts.push(nft);
        }
      }
      return usersNfts;
    },
    [E1155, E721, E721B, E1155B, setAmount]
  );

  useEffect(() => {
    // stupid way to force refetch
    const start = refetchAfterOperation ? 0 : 0;
    const subscription = timer(start, 30 * SECOND_IN_MILLISECONDS)
      .pipe(
        switchMap(() => {
          if (!signer) return EMPTY;
          if (!currentAddress) return EMPTY;
          // we only support mainnet for graph E721 and E1555, other networks we need to roll out our own solution
          if (
            network !== NetworkName.localhost &&
            network !== NetworkName.ropsten
          )
            return EMPTY;
          setLoading(true);
          return from(fetchDevNfts(currentAddress, signer));
        }),
        map((items) => {
          addNfts(items, OWNED_NFT_TYPE.DEV_NFT);
        }),
        debounceTime(SECOND_IN_MILLISECONDS),
        map(() => {
          setLoading(false);
        }),
        catchError((e) => {
          setLoading(false);
          return of();
        })
      )
      .subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [
    signer,
    currentAddress,
    addNfts,
    network,
    fetchDevNfts,
    refetchAfterOperation,
  ]);

  // reset on wallet change
  useEffect(() => {
    addNfts([], OWNED_NFT_TYPE.DEV_NFT);
  }, [currentAddress, previousAddress, addNfts]);

  return { devNfts, isLoading };
};
