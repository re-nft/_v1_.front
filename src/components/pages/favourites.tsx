import React, { useState, useEffect, useContext } from "react";
import GraphContext from "../../contexts/graph";
import { UserData } from "../../contexts/graph/types";
import CatalogueLoader from "../catalogue/components/catalogue-loader";
import { Nft } from "../../contexts/graph/classes";
import createCancellablePromise from '../../contexts/create-cancellable-promise';
import CatalogueItem from "../catalogue/components/catalogue-item";

export const MyFavorites: React.FC = () => {
  const {getUserData, getUserNfts} = useContext(GraphContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nftItems, setNftItems] = useState<Nft[]>([]);
  
  useEffect(() => {
    setIsLoading(true);
    
    const dataRequest = createCancellablePromise(Promise.all([
      getUserNfts(),
      getUserData(),
    ]));

    dataRequest.promise.then(([nfts, userData]: [nfts: Nft[] | undefined, userData: UserData | undefined]) => {
      if (userData && nfts) {
        console.log(nfts);
        const allFavoeites = Object.keys(userData?.favorites ?? {});
        const items = allFavoeites.map((key: string) => {
          const [address, tokenId] = key.split('::');
          const nft = nfts.find((nft: Nft) => nft.address === address && nft.tokenId === tokenId);
          return nft;
        }).filter(Boolean);
        // @ts-ignore
        setNftItems(items);
        setIsLoading(false);
      } else {
        setNftItems([]);
        setIsLoading(false);
      }
    });
  }, []);

  if (isLoading) {
    return <CatalogueLoader />;
  }

  if (!isLoading && nftItems.length === 0) {
    return (
      <div className="center">
        You dont have any added in favorites
      </div>
    )
  }  

  return (
    <div className="content">
		<div className="content__row content__items">
      {nftItems.map((nft) => (
        <CatalogueItem 
          key={`${nft.address}::${nft.tokenId}`} 
          nft={nft}
        />
      ))}
		</div>
	</div>
  );
};

export default React.memo(MyFavorites);
