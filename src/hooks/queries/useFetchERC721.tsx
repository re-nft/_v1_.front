import { useCallback, useEffect } from "react";
import { fetchUserProd721 } from "../../services/graph";
import { Nft } from "../../types/classes";
import { debounceTime, EMPTY, from, map, switchMap, timer } from "rxjs";
import create from "zustand";
import shallow from "zustand/shallow";
import { SECOND_IN_MILLISECONDS } from "../../consts";
import { useWallet } from "../useWallet";
import { useCurrentAddress } from "../useCurrentAddress";
import { NetworkName, NftToken } from "../../types";

interface UserERC721State {
  users: Record<
    string,
    {
      nfts: Nft[];
      isLoading: boolean;
    }
  >;
  setUserNft: (user: string, items: Nft[]) => void;
  setLoading: (user: string, isLoading: boolean) => void;
}

const useERC721 = create<UserERC721State>((set) => ({
  users: {},
  setUserNft: (user: string, items: Nft[]) =>
    set((state) => {
      const previousNfts = state.users[user]?.nfts || [];
      const newNFTS = items.reduce((acc, item) => {
        acc.set(item.id, item);
        return acc;
      }, new Map<string, Nft>());
      let nfts = [];
      if (previousNfts.length === 0 || items.length === 0) {
        nfts = items;
      } else {
        nfts = previousNfts.filter((item) => {
          return newNFTS.has(item.id);
        });
      }
      return {
        ...state,
        users: {
          ...state.users,
          [`${user}`]: {
            ...state.users[user],
            nfts,
          },
        },
      };
    }),
  setLoading: (user: string, isLoading: boolean) =>
    set((state) => {
      return {
        ...state,
        users: {
          ...state.users,
          [`${user}`]: {
            ...state.users[user],
            isLoading,
          },
        },
      };
    }),
}));

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
          return new Nft(nft.address, nft.tokenId, "0", nft.isERC721, {
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
  const { signer, network } = useWallet();
  const isLoading = useERC721(
    useCallback(
      (state) => {
        return state.users[currentAddress]?.isLoading;
      },
      [currentAddress]
    ),
    shallow
  );
  const nfts = useERC721(
    useCallback(
      (state) => {
        const selector = state.users[currentAddress];
        if (!selector || !selector.nfts) return [];
        return selector.nfts;
      },
      [currentAddress]
    ),
    shallow
  );
  const setUserNft = useERC721((state) => state.setUserNft);
  const setLoading = useERC721((state) => state.setLoading);

  useEffect(() => {
    const subscription = timer(0, 30 * SECOND_IN_MILLISECONDS)
      .pipe(
        switchMap(() => {
          if (!signer) return EMPTY;
          if (!currentAddress) return EMPTY;
          // we only support mainnet for graph E721 and E1555, other networks we need to roll out our own solution
          if (network !== NetworkName.mainnet) return EMPTY;
          setLoading(currentAddress, true);
          return fetchERC721(currentAddress);
        }),
        map((items) => {
          if (items) setUserNft(currentAddress, items);
        }),
        debounceTime(SECOND_IN_MILLISECONDS),
        map(() => {
          setLoading(currentAddress, false);
        })
      )
      .subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [signer, currentAddress, setLoading, setUserNft]);

  return { ERC721: nfts, isLoading };
};
