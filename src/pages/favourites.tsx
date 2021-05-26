import React, { useState, useEffect, useContext, useCallback } from "react";

import GraphContext from "../contexts/graph";
import CatalogueLoader from "../components/catalogue-loader";
import { Nft } from "../contexts/graph/classes";
import { addOrRemoveUserFavorite } from "../services/firebase";
import CatalogueItem from "../components/catalogue-item";
import { getUniqueID } from "../controller/batch-controller";
import { CurrentAddressContextWrapper } from "../contexts/CurrentAddressContextWrapper";
import { NFTMetaContext } from "../contexts/NftMetaState";
import { myFavorites } from "../services/calculate-my-favorites";
import { useAllAvailableToLend } from "../contexts/graph/hooks/useAllAvailableToLend";

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
  const [currentAddress] = useContext(CurrentAddressContextWrapper);
  const { allAvailableToLend, isLoading: allAvailableIsLoading } =
    useAllAvailableToLend();
  const { userData, isLoading: userDataIsLoading, refreshUserData } = useContext(GraphContext);
  const [nftItems, setNftItems] = useState<Nft[]>([]);
  const [_, fetchNfts] = useContext(NFTMetaContext);


  const onRemoveFromFavorites = useCallback(
    (nft: Nft) => {
      // todo: we need to stop doing this. you can just pass a single nft, and it will
      // todo: contain information for both the address and tokenID, and whatever else
      // todo: the function may need in the future
      addOrRemoveUserFavorite(currentAddress, nft.address, nft.tokenId)
        .then(() => {
          refreshUserData();
        })
        .catch(() => {
          console.warn("could not add or remove user favourite");
        });
    },
    [currentAddress, refreshUserData]
  );

  useEffect(() => {
    if (!allAvailableToLend || !userData) return;
    const items = myFavorites(userData, allAvailableToLend);
    setNftItems(items);
  }, [allAvailableToLend, userData]);

  //Prefetch metadata
  useEffect(() => {
    fetchNfts(nftItems);
  }, [nftItems, fetchNfts]);

  const isLoading = userDataIsLoading || allAvailableIsLoading;

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
