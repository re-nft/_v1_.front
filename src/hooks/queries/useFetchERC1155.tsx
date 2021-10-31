import { fetchUserProd1155 } from "renft-front/services/graph";
import { Nft } from "renft-front/types/classes";
import { useCallback, useEffect, useState } from "react";
import {
  debounceTime,
  EMPTY,
  from,
  map,
  mergeMap,
  switchMap,
  timer,
  catchError,
  Observable,
  of,
} from "rxjs";
import {
  ERC1155_REFETCH_INTERVAL,
  SECOND_IN_MILLISECONDS,
} from "renft-front/consts";
import { getContractWithProvider } from "renft-front/utils";
import { useWallet } from "renft-front/hooks/store/useWallet";
import { useCurrentAddress } from "renft-front/hooks/misc/useCurrentAddress";
import { NetworkName, NftToken } from "renft-front/types";
import {
  OWNED_NFT_TYPE,
  useNftsStore,
} from "renft-front/hooks/store/useNftStore";
import shallow from "zustand/shallow";
import { usePrevious } from "renft-front/hooks/misc/usePrevious";
import {
  EventTrackedTransactionStateManager,
  SmartContractEventType,
  useEventTrackedTransactionState,
} from "renft-front/hooks/store/useEventTrackedTransactions";
import * as Sentry from "@sentry/nextjs";

const fetchERC1155 = (currentAddress: string): Observable<Nft[]> => {
  //TODO:eniko current limitation is 5000 items for ERC1155
  return from<Promise<NftToken[]>>(
    Promise.allSettled([
      fetchUserProd1155(currentAddress, 0),
      fetchUserProd1155(currentAddress, 1),
      fetchUserProd1155(currentAddress, 2),
      fetchUserProd1155(currentAddress, 3),
      fetchUserProd1155(currentAddress, 4),
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
      const set = new Set();
      const items: Nft[] = [];
      result.forEach((nft) => {
        const id = `${nft.tokenId}-${nft.address}`;
        if (!set.has(id)) {
          set.add(id);
          items.push(
            new Nft(nft.address, nft.tokenId, nft.isERC721, {
              meta: nft.meta,
              tokenURI: nft.tokenURI,
            })
          );
        }
      });
      return items;
    })
  );
};

export const useFetchERC1155 = (): { ERC1155: Nft[]; isLoading: boolean } => {
  const currentAddress = useCurrentAddress();
  const { signer, network } = useWallet();
  const [isLoading, setLoading] = useState(false);
  const previousAddress = usePrevious(currentAddress);
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
  const ERC1155 = useNftsStore(
    useCallback((state) => {
      const items = state.external_erc1155s.map((i) => {
        return state.nfts[i];
      });
      return items;
    }, []),
    shallow
  );
  const external_erc1155s = useNftsStore(
    useCallback((state) => {
      return state.external_erc1155s;
    }, []),
    shallow
  );
  const addNfts = useNftsStore(useCallback((state) => state.addNfts, []));
  const setAmount = useNftsStore(useCallback((state) => state.setAmount, []));

  useEffect(() => {
    const getAvailableTokenAmountForUser = async (nft: Nft) => {
      if (!currentAddress) return;
      else {
        const contract = await getContractWithProvider(nft.nftAddress, false);
        const amount = await contract
          .balanceOf(currentAddress, nft.tokenId)
          .catch((e) => {
            //this only works on mainnet, as graph data are from mainnet
            Sentry.captureException(e);
            return "0";
          });
        // amount should not be a too big number
        setAmount(nft.nId, Number(amount.toString));
      }
    };
    const subscription = from(ERC1155)
      .pipe(mergeMap(getAvailableTokenAmountForUser))
      .subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [currentAddress, setAmount, external_erc1155s, ERC1155]);

  useEffect(() => {
    // stupid way to force refetch
    const start = refetchAfterOperation ? 0 : 0;
    const subscription = timer(start, ERC1155_REFETCH_INTERVAL)
      .pipe(
        switchMap(() => {
          if (!signer) return EMPTY;
          if (!currentAddress) return EMPTY;
          // we only support mainnet for graph E721 and E1555, other networks we need to roll out our own solution
          if (network !== NetworkName.mainnet) return EMPTY;
          setLoading(true);
          return fetchERC1155(currentAddress);
        }),
        map((items) => {
          addNfts(items, OWNED_NFT_TYPE.EXTERNAL_ERC1155);
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
    addNfts([], OWNED_NFT_TYPE.EXTERNAL_ERC1155);
  }, [currentAddress, previousAddress, addNfts]);
  return { ERC1155, isLoading };
};
