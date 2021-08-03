import { useCallback, useContext, useEffect } from "react";
import { getUniqueCheckboxId } from "./useBatchItems";
import { fetchUserProd1155 } from "../services/graph";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import UserContext from "../contexts/UserProvider";
import { Nft } from "../contexts/graph/classes";
import { NftToken } from "../contexts/graph/types";
import { debounceTime, EMPTY, from, map, mergeMap, switchMap, timer } from "rxjs";
import create from "zustand";
import shallow from "zustand/shallow";
import produce from "immer";
import { devtools } from "zustand/middleware";
import { SECOND_IN_MILLISECONDS } from "../consts";
import { getContractWithProvider, hasDifference } from "../utils";

interface UserERC1155State {
  users: Record<
    string,
    {
      nfts: Nft[];
      isLoading: boolean;
    }
  >;
  setUserNft: (user: string, items: Nft[]) => void;
  setLoading: (user: string, isLoading: boolean) => void;
  setAmount: (user: string, id: string, amount: string) => void;
}

const fetchERC1155 = (currentAddress: string) => {
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
      const items: Nft[] = [];
      const resultIds = new Set<string>();
      result
        .map((nft) => {
          return new Nft(nft.address, nft.tokenId, "0", nft.isERC721, {
            meta: nft.meta,
            tokenURI: nft.tokenURI
          });
        })
        .forEach((nft) => {
          const id = getUniqueCheckboxId(nft as Nft);
          if (!resultIds.has(id)) {
            items.push(nft);
            resultIds.add(id);
          }
        });
      return items;
    })
  );
};
export const useERC1155 = create<UserERC1155State>(
  devtools((set, get) => ({
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
        return state.users[currentAddress]?.isLoading;
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
  const setUserNft = useERC1155((state) => state.setUserNft, shallow);
  const setLoading = useERC1155((state) => state.setLoading, shallow);
  const setAmount = useERC1155((state) => state.setAmount, shallow);

  useEffect(() => {
    const getAvailableTokenAmountForUser = async (nft: Nft) => {
      if (!currentAddress) return;
      else {
        const contract = await getContractWithProvider(nft.address, false);
        const amount = await contract
          .balanceOf(currentAddress, nft.tokenId)
          .catch((e) => {
            //this only works on mainnet, as graph data are from mainnet
            console.log(e);
            return "0";
          });
        setAmount(currentAddress, getUniqueCheckboxId(nft), amount.toString());
      }
    };
    const subscription = from(nfts)
      .pipe(mergeMap(getAvailableTokenAmountForUser))
      .subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [currentAddress, setAmount, nfts]);

  useEffect(() => {
    const subscription = timer(0, 30 * SECOND_IN_MILLISECONDS)
      .pipe(
        switchMap(() => {
          if (!signer) return EMPTY;
          if (!currentAddress) return EMPTY;
          setLoading(currentAddress, true);
          return fetchERC1155(currentAddress);
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
  }, [signer, currentAddress]);

  return { ERC1155: nfts, isLoading };
};
