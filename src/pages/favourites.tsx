import React, { useState, useEffect, useContext, useCallback } from "react";

import GraphContext from "../contexts/graph";
import { UserData } from "../contexts/graph/types";
import { CurrentAddressContext } from "../hardhat/SymfoniContext";
import CatalogueLoader from "../components/catalogue-loader";
import { Nft } from "../contexts/graph/classes";
import createCancellablePromise from "../contexts/create-cancellable-promise";
import { addOrRemoveUserFavorite } from "../services/firebase";
import CatalogueItem from "../components/catalogue-item";
import { calculateMyFavorites } from "../services/calculate-my-favorites";
import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../consts";

export const MyFavorites: React.FC = () => {
  const [currentAddress] = useContext(CurrentAddressContext);
  const { getUserData, getUserNfts } = useContext(GraphContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nftItems, setNftItems] = useState<Nft[]>([]);

  const refreshState = useCallback(() => {
    Promise.all([getUserNfts(), getUserData()])
      .then(
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
      )
      .catch(() => {
        console.warn("could not refresh state");
      });
  }, [getUserNfts, getUserData, setNftItems, setIsLoading]);

  const onRemoveFromFavorites = useCallback(
    (nft: Nft) => {
      setIsLoading(true);
      addOrRemoveUserFavorite(currentAddress, nft.address, nft.tokenId)
        .then(() => {
          refreshState();
        })
        .catch(() => {
          console.warn("could not add or remove user favourite");
        });
    },
    [setIsLoading, refreshState, currentAddress]
  );

  useEffect(() => {
    setIsLoading(true);

    const dataRequest = createCancellablePromise(
      Promise.all([getUserNfts(), getUserData()])
    );

    // TODO: remove all the ts-ignores

    dataRequest.promise
      .then(
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
      )
      .catch(() => {
        console.warn("could not perform data request");
      });

    return dataRequest.cancel;
    /* eslint-disable-next-line */
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
        {nftItems.map((nft, ix) => (
          <CatalogueItem
            key={`${nft.address}${RENFT_SUBGRAPH_ID_SEPARATOR}${nft.tokenId}${ix}`}
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
