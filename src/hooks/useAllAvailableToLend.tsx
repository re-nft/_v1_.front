import { useContext, useMemo } from "react";
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

  const allAvailableToLend: Nft[] = useMemo(() => {
    if (network !== process.env.REACT_APP_NETWORK_SUPPORTED) return [];
    return [
      ...devNfts,
      ...ERC1155,
      ...ERC721
        //weird duplicated 721 from 1555
        .filter(
          (nft) => nft.address === "0x2af75676692817d85121353f0d6e8e9ae6ad5576"
        )
    ];
  }, [ERC1155, ERC721, devNfts, network]);
  const isLoading = useMemo(() => {
    if (network !== process.env.REACT_APP_NETWORK_SUPPORTED) return false;
    return erc1155Loading || erc721Loading || devIsLoading;
  }, [erc1155Loading, erc721Loading, devIsLoading, network]);

  return { allAvailableToLend, isLoading };
};
