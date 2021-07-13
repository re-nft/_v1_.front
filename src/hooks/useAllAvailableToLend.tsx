import { useMemo } from "react";
import { Nft } from "../contexts/graph/classes";
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

  const allAvailableToLend: Nft[] = useMemo(() => {
    return [...devNfts, ...ERC1155, ...ERC721];
  }, [ERC1155, ERC721, devNfts]);
  const isLoading = useMemo(() => {
    return erc1155Loading || erc721Loading || devIsLoading;
  }, [erc1155Loading, erc721Loading, devIsLoading]);

  return { allAvailableToLend, isLoading };
};
