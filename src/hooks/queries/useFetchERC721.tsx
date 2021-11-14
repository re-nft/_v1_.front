import { useCallback, useEffect, useState } from "react";
import { fetchUserProd721 } from "renft-front/services/graph";
import { Nft } from "renft-front/types/classes";
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
import { useWallet } from "renft-front/hooks/store/useWallet";
import { useCurrentAddress } from "renft-front/hooks/misc/useCurrentAddress";
import { NetworkName, NftToken } from "renft-front/types";
import {
  OWNED_NFT_TYPE,
  useNftsStore,
} from "renft-front/hooks/store/useNftStore";
import { usePrevious } from "renft-front/hooks/misc/usePrevious";
import {
  EventTrackedTransactionStateManager,
  SmartContractEventType,
  useEventTrackedTransactionState,
} from "renft-front/hooks/store/useEventTrackedTransactions";
import shallow from "zustand/shallow";
import * as Sentry from "@sentry/nextjs";

const fetchERC721 = (currentAddress: string) => {
  //TODO:eniko current limitation is 5000 items for ERC721
  return from(
    Promise.allSettled([
      fetchUserProd721(currentAddress, 0),
      fetchUserProd721(currentAddress, 1),
      fetchUserProd721(currentAddress, 2),
      fetchUserProd721(currentAddress, 3),
      fetchUserProd721(currentAddress, 4),
    ]).then((r) => {
      return r.reduce<NftToken[]>((acc, v) => {
        if (v.status === "fulfilled") {
          acc = [...acc, ...v.value];
        }
        return acc;
      }, []);
    })
  ).pipe(
    map((result) => {
      // filter out duplicates
      const items: Nft[] = [];
      const resultIds = new Set();
      result
        .map((nft) => {
          return new Nft(nft.address, nft.tokenId, nft.isERC721, {
            meta: nft.meta,
            tokenURI: nft.tokenURI,
          });
        })
        .forEach((nft) => {
          if (!resultIds.has(nft.id)) {
            items.push(nft);
            resultIds.add(nft.id);
          }
        });
      return items;
    })
  );
};
export const useFetchERC721 = (): { ERC721: Nft[]; isLoading: boolean } => {
  const currentAddress = useCurrentAddress();
  const previousAddress = usePrevious(currentAddress);
  const { signer, network } = useWallet();
  const [isLoading, setLoading] = useState(false);
  const refetchAfterOperation = useEventTrackedTransactionState(
    useCallback((state: EventTrackedTransactionStateManager) => {
      const pendingStopRentals =
        state.pendingTransactions[SmartContractEventType.STOP_LEND];
      const pendingLendings =
        state.pendingTransactions[SmartContractEventType.START_LEND];
      // refetch will change when you start renting goes from non-empty array to empty array
      return pendingLendings.length * 1 + pendingStopRentals.length * 2;
    }, []),
    shallow
  );
  const ERC721 = useNftsStore(
    useCallback((state) => {
      return state.external_erc721s.map((i) => {
        return state.nfts[i];
      });
    }, [])
  );
  const addNfts = useNftsStore(useCallback((state) => state.addNfts, []));

  useEffect(() => {
    // stupid way to force refetch
    const start = refetchAfterOperation ? 0 : 0;
    const subscription = timer(start, 30 * SECOND_IN_MILLISECONDS)
      .pipe(
        switchMap(() => {
          if (!signer) return EMPTY;
          if (!currentAddress) return EMPTY;
          // we only support mainnet for graph E721 and E1555, other networks we need to roll out our own solution
          if (network !== NetworkName.mainnet) return EMPTY;
          setLoading(true);
          return fetchERC721(currentAddress);
        }),
        map((items) => {
          addNfts(items, OWNED_NFT_TYPE.EXTERNAL_ERC721);
        }),
        debounceTime(SECOND_IN_MILLISECONDS),
        map(() => {
          setLoading(false);
        }),
        catchError((e) => {
          //TODO:eniko dev test
          Sentry.captureException(e);
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
    setLoading,
    addNfts,
    refetchAfterOperation,
    network,
  ]);

  // reset on wallet change
  useEffect(() => {
    addNfts([], OWNED_NFT_TYPE.EXTERNAL_ERC721);
  }, [currentAddress, previousAddress, addNfts]);

  return { ERC721, isLoading };
};
