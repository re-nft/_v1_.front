import React, { useState, useEffect, useContext, useCallback } from "react";
import GraphContext from "../contexts/graph";
import { UserData } from "../contexts/graph/types";
import { CurrentAddressContext } from "../hardhat/SymfoniContext";
import CatalogueLoader from "../components/catalogue-loader";
import { Nft } from "../contexts/graph/classes";
import createCancellablePromise from "../contexts/create-cancellable-promise";
import { addOrRemoveUserFavorite } from "../services/firebase";
import CatalogueItem from "../components/catalogue-item";
import { calculateMyFavorites } from "../services/calculate-my-faforites";

export const MyFavorites: React.FC = () => {
  const [currentAddress] = useContext(CurrentAddressContext);
  const { getUserData, getUserNfts } = useContext(GraphContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nftItems, setNftItems] = useState<Nft[]>([]);

  const onRemoveFromFavorites = useCallback((nft: Nft) => {
    setIsLoading(true);
    addOrRemoveUserFavorite(currentAddress, nft.address, nft.tokenId).then(
      (resp: boolean) => {
        refreshState();
      }
    );
  }, []);

  const refreshState = () => {
    Promise.all([getUserNfts(), getUserData()]).then(
      ([nfts, userData]: [
        nfts: Nft[] | undefined,
        userData: UserData | undefined
      ]) => {
        if (userData && nfts) {
          const items = calculateMyFavorites(userData, nfts);
          // @ts-ignore
          setNftItems(items || []);
          setIsLoading(false);
        }
      }
    );
  };

  useEffect(() => {
    setIsLoading(true);

    const dataRequest = createCancellablePromise(
      Promise.all([getUserNfts(), getUserData()])
    );

    dataRequest.promise.then(
      ([nfts, userData]: [
        nfts: Nft[] | undefined,
        userData: UserData | undefined
      ]) => {
        if (userData && nfts) {
          const items = calculateMyFavorites(userData, nfts);
          // @ts-ignore
          setNftItems(items || []);
          setIsLoading(false);
        }
      }
    );
  }, []);

  if (isLoading) {
    return <CatalogueLoader />;
  }

  if (!isLoading && nftItems.length === 0) {
    return <div className="center">You dont have any added in favorites</div>;
  }

  return (
    <div className="content">
      <div className="content__row content__items">
        {nftItems.map((nft) => (
          <CatalogueItem
            key={`${nft.address}::${nft.tokenId}`}
            nft={nft}
            isAlreadyFavourited
          >
            <div className="nft__control">
              <button
                className="nft__button"
                onClick={() => onRemoveFromFavorites(nft)}
              >
                Remove
              </button>
            </div>
          </CatalogueItem>
        ))}
      </div>
    </div>
  );
};

export default React.memo(MyFavorites);
