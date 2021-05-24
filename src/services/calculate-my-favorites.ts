import { UserData } from "../contexts/graph/types";
import { Nft } from "../contexts/graph/classes";
import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../consts";

export const myFavorites = (userData: UserData, nfts: Nft[]): Nft[] => {
  const favoriteNfts: Nft[] = [];

  for (const [nftID, isFav] of Object.entries(userData?.favorites ?? {})) {
    if (!isFav) continue;
    const [addr, tokenID] = nftID.split(RENFT_SUBGRAPH_ID_SEPARATOR);
    const nft = nfts.find(
      (nft) => nft.address === addr && nft.tokenId === tokenID
    );
    if (!nft) continue;
    favoriteNfts.push(nft);
  }

  return favoriteNfts;
};
