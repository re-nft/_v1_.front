import { useCallback, useContext, useEffect } from "react";
import { getUniqueCheckboxId } from "../controller/batch-controller";
import { fetchUserProd721 } from "../services/graph";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import UserContext from "../contexts/UserProvider";
import { Nft } from "../contexts/graph/classes";
import { NftToken } from "../contexts/graph/types";
import { EMPTY, from, map, switchMap, timer } from "rxjs";
import create from "zustand";
import shallow from "zustand/shallow";
import produce from "immer";
import { SECOND_IN_MILLISECONDS } from "../consts";

interface UserERC721State {
  users: Record<
    string,
    {
      nfts: Nft[];
      ids: Set<string>;
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
        state.users[user].nfts = items;
        state.users[user].ids = new Set(items.map(getUniqueCheckboxId));
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

export const useFetchERC721 = (): { ERC721: Nft[]; isLoading: boolean } => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { signer } = useContext(UserContext);
  const isLoading = useERC721(
    useCallback(
      (state) => {
        const selector = state.users[currentAddress];
        if (!selector || !selector.isLoading) return false;
        return selector.isLoading;
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
  const ids = useERC721(
    useCallback(
      (state) => {
        const selector = state.users[currentAddress];
        if (!selector || !selector.ids) return new Set();
        return selector.ids;
      },
      [currentAddress]
    ),
    shallow
  );
  const setUserNft = useERC721((state) => state.setUserNft, shallow);
  const setLoading = useERC721((state) => state.setLoading, shallow);

  useEffect(() => {
    function fetchAndCreate() {
      if (!signer) return EMPTY;
      if (!currentAddress) return EMPTY;
      setLoading(currentAddress, true);
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
          return result
            .filter((nft) => !ids.has(getUniqueCheckboxId(nft as Nft)))

            .map((nft) => {
              return new Nft(nft.address, nft.tokenId, "0", nft.isERC721, {
                meta: nft.meta,
                tokenURI: nft.tokenURI
              });
            });
        }),
        map((usersNfts721) => {
          const items: Nft[] = [];
          const resultIds = new Set();
          usersNfts721.forEach((nft) => {
            const id = getUniqueCheckboxId(nft);
            if (!resultIds.has(id)) {
              items.push(nft);
              resultIds.add(id);
            }
          });

          if (items.length > 0) {
            setUserNft(currentAddress, items);
          }
          setLoading(currentAddress, false);
        })
      );
    }
    const subscription = timer(0, 30 * SECOND_IN_MILLISECONDS)
      .pipe(switchMap(fetchAndCreate))
      .subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [signer, currentAddress, ids]);

  return { ERC721: nfts, isLoading };
};
