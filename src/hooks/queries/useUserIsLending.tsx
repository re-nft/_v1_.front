import { Lending, Nft } from "../../types/classes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrevious } from "../misc/usePrevious";
import { SECOND_IN_MILLISECONDS } from "../../consts";
import { EMPTY, from, map, switchMap, timer } from "rxjs";
import { timeItAsync } from "../../utils";
import { LendingRaw } from "../../types";
import request from "graphql-request";
import { queryUserLendingRenft } from "../../services/queries";
import { useWallet } from "../store/useWallet";
import { useCurrentAddress } from "../misc/useCurrentAddress";
import {
  NFTRentType,
  useLendingStore,
  useNftsStore
} from "../store/useNftStore";
import shallow from "zustand/shallow";

export const useUserIsLending = () => {
  const currentAddress = useCurrentAddress();
  const previousAddress = usePrevious(currentAddress);
  const { signer, network } = useWallet();
  const [isLoading, setLoading] = useState(false);

  const addNfts = useNftsStore((state) => state.addNfts);
  const addLendings = useLendingStore((state) => state.addLendings);
  const lendings = useLendingStore(
    useCallback((state) => state.lendings, []),
    shallow
  );
  const userIsLendingIds = useLendingStore(
    useCallback((state) => state.userIsLending, []),
    shallow
  );

  const fetchLending = useCallback(() => {
    if (!signer) return EMPTY;
    if (!process.env.NEXT_PUBLIC_RENFT_API) {
      throw new Error("RENFT_API is not defined");
    }
    if (network !== process.env.NEXT_PUBLIC_NETWORK_SUPPORTED) {
      if (userIsLendingIds && userIsLendingIds.length > 0)
        addLendings([], NFTRentType.USER_IS_LENDING);
      return EMPTY;
    }

    const subgraphURI = process.env.NEXT_PUBLIC_RENFT_API;
    setLoading(true);

    const fetchRequest = from<
      Promise<{
        users: { lending: LendingRaw[] }[];
      }>
    >(
      timeItAsync("Pulled Users ReNFT Lendings", async () => {
        return request(
          subgraphURI,
          queryUserLendingRenft(currentAddress)
        ).catch((e) => {
          // ! let's warn with unique messages, without console logging the error message
          // ! that something went wrong. That way, if the app behaves incorrectly, we will
          // ! know where to look. Right now I am running into an issue of localising the
          // ! problem why user's lending does not show and there is no console.warn here
          console.warn("could not pull users ReNFT lendings");
          return {};
        });
      })
    ).pipe(
      map((response) => {
        if (response && response.users && response.users[0]) {
          return Object.values(response.users[0].lending).filter(
            (v) => v != null
          );
        }
      }),
      map((lendings) => {
        if (!lendings) {
          setLoading(false);
          return;
        }
        const nfts = lendings.map(
          (lendingRaw) =>
            new Nft(
              lendingRaw.nftAddress,
              lendingRaw.tokenId,
              lendingRaw.lentAmount,
              lendingRaw.isERC721
            )
        );
        addNfts(nfts);
        addLendings(
          lendings.map((r) => new Lending(r)),
          NFTRentType.USER_IS_LENDING
        );
        setLoading(false);
      })
    );
    return fetchRequest;
  }, [
    currentAddress,
    previousAddress,
    signer,
    network,
    setLoading,
    addLendings
  ]);

  useEffect(() => {
    const subscription = timer(0, 10 * SECOND_IN_MILLISECONDS)
      .pipe(switchMap(fetchLending))
      .subscribe();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [fetchLending, currentAddress]);

  const userLending = useMemo(() => {
    return userIsLendingIds.map((i) => {
      return lendings[i];
    });
  }, [userIsLendingIds, lendings]);

  return { userLending, isLoading };
};
