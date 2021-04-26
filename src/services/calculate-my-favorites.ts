import { UserData } from "../contexts/graph/types";
import { Nft } from "../contexts/graph/classes";
import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../consts";

export const calculateMyFavorites = (
  userData: UserData,
  nfts: Nft[]
): (Nft | undefined)[] => {
  const allFavoeites = Object.entries(userData?.favorites ?? {}).filter(
    ([_, value]) => value === true
  );
  return allFavoeites
    .map(([key]) => {
      const [address, tokenId] = key.split(RENFT_SUBGRAPH_ID_SEPARATOR);
      const nft = nfts.find(
        (nft: Nft) => nft.address === address && nft.tokenId === tokenId
      );
      return nft;
    })
    .filter(Boolean);
};
