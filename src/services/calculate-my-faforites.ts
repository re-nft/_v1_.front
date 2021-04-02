import {UserData} from '../contexts/graph/types';
import { Nft } from "../contexts/graph/classes";

export const calculateMyFavorites = (userData: UserData, nfts: Nft[]) => {
    const allFavoeites = Object.entries(userData?.favorites ?? {}).filter(([key, value]) => value === true);
    return allFavoeites.map(([key]) => {
      const [address, tokenId] = key.split('::');
      const nft = nfts.find((nft: Nft) => nft.address === address && nft.tokenId === tokenId);
      return nft;
    }).filter(Boolean);
  };