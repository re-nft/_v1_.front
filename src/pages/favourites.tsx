import React, { useState, useEffect, useContext, useCallback } from "react";

import GraphContext from "../contexts/graph";
import { CurrentAddressContext } from "../hardhat/SymfoniContext";
import CatalogueLoader from "../components/catalogue-loader";
import { Nft } from "../contexts/graph/classes";
import createCancellablePromise from "../contexts/create-cancellable-promise";
import { addOrRemoveUserFavorite } from "../services/firebase";
import CatalogueItem from "../components/catalogue-item";
import { myFavorites } from "../services/calculate-my-favorites";
import { getUniqueID } from "../controller/batch-controller";

type RemoveButtonProps = {
  nft: Nft;
  onRemoveFromFavorites: (nft: Nft) => void;
};

const RemoveButton: React.FC<RemoveButtonProps> = ({
  nft,
  onRemoveFromFavorites,
}) => {
  const handleRemoveFromFavorites = useCallback(() => {
    onRemoveFromFavorites(nft);
  }, [onRemoveFromFavorites, nft]);

  return (
    <button className="nft__button" onClick={handleRemoveFromFavorites}>
      Remove
    </button>
  );
};

export const MyFavorites: React.FC = () => {
  const [currentAddress] = useContext(CurrentAddressContext);
  const { getUserData, getAllAvailableToLend } = useContext(GraphContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nftItems, setNftItems] = useState<Nft[]>([]);

  const refreshState = useCallback(() => {
    Promise.all([getAllAvailableToLend(), getUserData()])
      .then(([nfts, userData]) => {
        if (!nfts) return;

        const items = myFavorites(userData, nfts);

        setNftItems(items);
        setIsLoading(false);
      })
      .catch(() => {
        console.warn("could not refresh state");
      });
  }, [getAllAvailableToLend, getUserData, setNftItems, setIsLoading]);

  const onRemoveFromFavorites = useCallback(
    (nft: Nft) => {
      setIsLoading(true);

      // todo: we need to stop doing this. you can just pass a single nft, and it will
      // todo: contain information for both the address and tokenID, and whatever else
      // todo: the function may need in the future
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
      Promise.all([getAllAvailableToLend(), getUserData()])
    );

    dataRequest.promise
      .then(([nfts, userData]) => {
        if (!nfts) return;

        const items = myFavorites(userData, nfts);

        setNftItems(items);
        setIsLoading(false);
      })
      .catch(() => {
        console.warn("could not perform data request");
      });

    return dataRequest.cancel;
  }, [getAllAvailableToLend, getUserData]);

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
            key={getUniqueID(nft.address, nft.tokenId)}
            nft={nft}
            isAlreadyFavourited
          >
            <div className="nft__control">
              <RemoveButton
                nft={nft}
                onRemoveFromFavorites={onRemoveFromFavorites}
              />
            </div>
          </CatalogueItem>
        ))}
      </div>
    </div>
  );
};

export default React.memo(MyFavorites);
