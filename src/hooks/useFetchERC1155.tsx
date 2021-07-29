import { useCallback, useContext, useEffect } from "react";
import { getUniqueCheckboxId } from "../controller/batch-controller";
import { fetchUserProd1155 } from "../services/graph";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import UserContext from "../contexts/UserProvider";
import { Nft } from "../contexts/graph/classes";
import { NftToken } from "../contexts/graph/types";
import { EMPTY, from, map, mergeMap, switchMap, timer } from "rxjs";
import create from "zustand";
import shallow from "zustand/shallow";
import produce from "immer";
import { devtools } from "zustand/middleware";
import { SECOND_IN_MILLISECONDS } from "../consts";
import { getContractWithProvider } from "../utils";

interface UserERC1155State {
  users: Record<
    string,
    {
      nfts: Nft[];
      isLoading: boolean;
      ids: Set<string>;
    }
  >;
  setUserNft: (user: string, items: Nft[]) => void;
  setLoading: (user: string, isLoading: boolean) => void;
  setAmount: (user: string, id: string, amount: string) => void;
}

export const useERC1155 = create<UserERC1155State>(
  devtools((set, get) => ({
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
      ),
    setAmount: (user: string, id: string, amount: string) =>
      set(
        produce((state) => {
          if (!get().users[user]) state.users[user] = {};
          const nft = get().users[user]?.nfts?.find(
            (nft: Nft) => getUniqueCheckboxId(nft) === id
          );
          if (nft) nft.amount = amount;
        })
      )
  }))
);

export const useFetchERC1155 = (): { ERC1155: Nft[]; isLoading: boolean } => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { signer } = useContext(UserContext);

  const isLoading = useERC1155(
    useCallback(
      (state) => {
        const selector = state.users[currentAddress];
        if (!selector) return false;
        return selector.isLoading;
      },
      [currentAddress]
    ),
    shallow
  );
  const nfts = useERC1155(
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
  const ids = useERC1155(
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
  const setUserNft = useERC1155((state) => state.setUserNft, shallow);
  const setLoading = useERC1155((state) => state.setLoading, shallow);
  const setAmount = useERC1155((state) => state.setAmount, shallow);

  useEffect(() => {
    const getAvailableTokenAmountForUser = async (nft: Nft) => {
      if (!currentAddress) return;
      else {
        const contract = await getContractWithProvider(
          nft.address,
          false
        );
        const amount = await contract
          .balanceOf(currentAddress, nft.tokenId)
          .catch((e) => {
            //this only works on mainnet, as graph data are from mainnet
            console.log(e)
            return "0";
          });
        setAmount(currentAddress, getUniqueCheckboxId(nft), amount.toString());
      }
    };
    const subscription = from(nfts).pipe(mergeMap(getAvailableTokenAmountForUser)).subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [currentAddress, setAmount, nfts]);

  useEffect(() => {
    function fetchAndCreate() {
      if (!signer) return EMPTY;
      if (!currentAddress) return EMPTY;
      setLoading(currentAddress, true);
      //TODO:eniko current limitation is 5000 items for ERC1155
      return from<Promise<NftToken[]>>(
        Promise.allSettled([
          fetchUserProd1155(currentAddress, 0),
          fetchUserProd1155(currentAddress, 1),
          fetchUserProd1155(currentAddress, 2),
          fetchUserProd1155(currentAddress, 3),
          fetchUserProd1155(currentAddress, 4)
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
        map((usersNfts1155) => {
          const items: Nft[] = [];
          const resultIds = new Set<string>();
          usersNfts1155.forEach((nft) => {
            const id = getUniqueCheckboxId(nft as Nft);
            if (!resultIds.has(id)) {
              items.push(nft);
              resultIds.add(id);
            }
          });
          if (items.length > 0) {
            setUserNft(currentAddress, [...items, ...nfts]);
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

  return { ERC1155: nfts, isLoading };
};
