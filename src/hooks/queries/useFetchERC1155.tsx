import { fetchUserProd1155 } from "../../services/graph";
import { Nft } from "../../types/classes";
import { useCallback, useEffect, useState } from "react";
import {
  debounceTime,
  EMPTY,
  from,
  map,
  mergeMap,
  switchMap,
  timer
} from "rxjs";
import { SECOND_IN_MILLISECONDS } from "../../consts";
import { getContractWithProvider } from "../../utils";
import { useWallet } from "../store/useWallet";
import { useCurrentAddress } from "../misc/useCurrentAddress";
import { NetworkName, NftToken } from "../../types";
import { OWNED_NFT_TYPE, useNftsStore } from "../store/useNftStore";
import shallow from "zustand/shallow";
import { usePrevious } from "../misc/usePrevious";

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
      return result.map((nft) => {
        return new Nft(nft.address, nft.tokenId, "0", nft.isERC721, {
          meta: nft.meta,
          tokenURI: nft.tokenURI
        });
      });
    })
  );
};

export const useFetchERC1155 = (): { ERC1155: Nft[]; isLoading: boolean } => {
  const currentAddress = useCurrentAddress();
  const { signer, network } = useWallet();
  const [isLoading, setLoading] = useState(false);
  const previousAddress = usePrevious(currentAddress);

  const ERC1155 = useNftsStore(
    useCallback((state) => {
      return state.external_erc1155s.map((i) => {
        return state.nfts[i];
      });
    }, []),
    shallow
  );
  const external_erc1155s = useNftsStore(
    useCallback((state) => {
      return state.external_erc1155s;
    }, []),
    shallow
  );
  const addNfts = useNftsStore((state) => state.addNfts);
  const setAmount = useNftsStore((state) => state.setAmount);

  useEffect(() => {
    const getAvailableTokenAmountForUser = async (nft: Nft) => {
      if (!currentAddress) return;
      else {
        const contract = await getContractWithProvider(nft.nftAddress, false);
        const amount = await contract
          .balanceOf(currentAddress, nft.tokenId)
          .catch((e) => {
            //this only works on mainnet, as graph data are from mainnet
            console.log(e);
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
    const subscription = timer(0, 30 * SECOND_IN_MILLISECONDS)
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
        })
      )
      .subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [signer, currentAddress, setLoading, addNfts]);

  // reset on wallet change
  useEffect(() => {
    addNfts([], OWNED_NFT_TYPE.EXTERNAL_ERC1155);
  }, [currentAddress, previousAddress, addNfts]);
  return { ERC1155, isLoading };
};
