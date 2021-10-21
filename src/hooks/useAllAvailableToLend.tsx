import { useContext, useMemo } from "react";
import { filterByCompany } from "../utils";
import { Nft } from "../contexts/graph/classes";
import UserContext from "../contexts/UserProvider";
import { useFetchERC1155 } from "./useFetchERC1155";
import { useFetchERC721 } from "./useFetchERC721";
import { useFetchNftDev } from "./useFetchNftDev";

export const useAllAvailableToLend = (): {
  allAvailableToLend: Nft[];
  isLoading: boolean;
} => {
  const { devNfts, isLoading: devIsLoading } = useFetchNftDev();
  const { ERC721, isLoading: erc721Loading } = useFetchERC721();
  const { ERC1155, isLoading: erc1155Loading } = useFetchERC1155();
  const { network } = useContext(UserContext);

  // TODO: general solution is in utils.ts: isDegenerateNft. It checks
  // TODO: if the contract supports both 721 and 1155 at the same time
  // TODO: it is not performmant, it requires multicall. Thus the cheat
  // TODO: below with hardcoding

  const filteredERC1155 = useMemo(() => {
    return ERC1155.filter(filterByCompany());
  }, [ERC1155]);

  const filteredERC721 = useMemo(() => {
    return ERC721.filter(filterByCompany());
  }, [ERC721]);

  const allAvailableToLend: Nft[] = useMemo(() => {
    if (network !== process.env.NEXT_PUBLIC_NETWORK_SUPPORTED) return [];
    return [...devNfts, ...filteredERC1155, ...filteredERC721];
  }, [filteredERC1155, filteredERC721, devNfts, network]);

  const isLoading = useMemo(() => {
    if (network !== process.env.NEXT_PUBLIC_NETWORK_SUPPORTED) return false;
    return erc1155Loading || erc721Loading || devIsLoading;
  }, [erc1155Loading, erc721Loading, devIsLoading, network]);

  return { allAvailableToLend, isLoading };
};
