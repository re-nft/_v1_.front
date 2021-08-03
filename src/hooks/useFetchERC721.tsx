import { useCallback, useContext, useEffect } from "react";
import { getUniqueCheckboxId } from "./useBatchItems";
import { fetchUserProd721 } from "../services/graph";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import UserContext from "../contexts/UserProvider";
import { Nft } from "../contexts/graph/classes";
import { NftToken } from "../contexts/graph/types";
import { debounceTime, EMPTY, from, map, switchMap, timer } from "rxjs";
import create from "zustand";
import shallow from "zustand/shallow";
import produce from "immer";
import { SECOND_IN_MILLISECONDS } from "../consts";
import { hasDifference } from "../utils";

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

const useERC721 = create<UserERC721State>((set, get) => ({
  users: {},
  setUserNft: (user: string, items: Nft[]) =>
    set(
      produce((state) => {
        if (!get().users[user]) state.users[user] = {};
        const previousNfts = get().users[user].nfts || [];
        if (hasDifference(previousNfts, items)) {
          state.users[user].nfts = items;
        }
      })
    ),
  setLoading: (user: string, isLoading: boolean) =>
    set(
      produce((state) => {
        if (!get().users[user]) state.users[user] = {};
        state.users[user].isLoading = isLoading;
      })
    )
}));

const fetchERC721 = (currentAddress: string) => {
  //TODO:eniko current limitation is 5000 items for ERC721
  return from(
    Promise.allSettled([
      fetchUserProd721(currentAddress, 0),
      fetchUserProd721(currentAddress, 1),
      fetchUserProd721(currentAddress, 2),
      fetchUserProd721(currentAddress, 3),
      fetchUserProd721(currentAddress, 4)
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
            tokenURI: nft.tokenURI
          });
        })
        .forEach((nft) => {
          const id = getUniqueCheckboxId(nft);
          if (!resultIds.has(id)) {
            items.push(nft);
            resultIds.add(id);
          }
        });
      return items;
    })
  );
};
export const useFetchERC721 = (): { ERC721: Nft[]; isLoading: boolean } => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { signer } = useContext(UserContext);
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
  const setUserNft = useERC721((state) => state.setUserNft, shallow);
  const setLoading = useERC721((state) => state.setLoading, shallow);

  useEffect(() => {
    const subscription = timer(0, 30 * SECOND_IN_MILLISECONDS)
      .pipe(
        switchMap(() => {
          if (!signer) return EMPTY;
          if (!currentAddress) return EMPTY;
          setLoading(currentAddress, true);
          return fetchERC721(currentAddress);
        }),
        map((items) => {
          if (items) setUserNft(currentAddress, items);
        }),
        debounceTime(500),
        map(() => {
          setLoading(currentAddress, false)
        })
      )
      .subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [signer, currentAddress, signer]);

  return { ERC721: nfts, isLoading };
};
