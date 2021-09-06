import React, { useState, useEffect, useContext, useCallback } from "react";

import GraphContext from "../contexts/graph";
import CatalogueLoader from "../components/catalogue-loader";
import { Nft } from "../contexts/graph/classes";
import { CatalogueItem } from "../components/catalogue-item";
import { useBatchItems } from "../hooks/useBatchItems";
import { myFavorites } from "../services/calculate-my-favorites";
import { Button } from "../components/common/button";
import { useAllAvailableForRent } from "../hooks/useAllAvailableForRent";
import ToggleLayout from "../components/toggle-layout";
import ItemWrapper from "../components/common/items-wrapper";
import { PaginationList } from "../components/pagination-list";

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

  return <Button onClick={handleRemoveFromFavorites} description="Remove" />;
};

export const MyFavorites: React.FC = () => {
  const { allAvailableToRent, isLoading: allAvailableIsLoading } =
    useAllAvailableForRent();
  const { userData, isLoading: userDataIsLoading } = useContext(GraphContext);
  const [nftItems, setNftItems] = useState<Nft[]>([]);
  const { onCheckboxChange } = useBatchItems();

  useEffect(() => {
    if (!allAvailableToRent || !userData) return;
    const items = myFavorites(userData, allAvailableToRent);
    setNftItems(items);
  }, [allAvailableToRent, userData]);

  const checkBoxChangeWrapped = useCallback(
    (nft) => {
      return () => {
        onCheckboxChange(nft);
      };
    },
    [onCheckboxChange]
  );

  const isLoading = userDataIsLoading || allAvailableIsLoading;

  if (isLoading) {
    return (
      <div className="mx-auto">
        <CatalogueLoader />
      </div>
    );
  }

  if (!isLoading && nftItems.length === 0) {
    return (
      <div className="mx-auto text-center text-base text-white font-display py-32 leading-tight">
        You dont have any added in favorites
      </div>
    );
  }
  // TODO pagination control
  return (
    <ToggleLayout tabs={[]}>
      <PaginationList
        nfts={nftItems}
        ItemsRenderer={({ currentPage }) => {
          return (
            <ItemWrapper flipId={currentPage.map((c) => c.id).join("")}>
              {currentPage.map((nft: Nft) => (
                <CatalogueItem
                  key={nft.id}
                  nft={nft}
                  isAlreadyFavourited
                  onCheckboxChange={checkBoxChangeWrapped(nft)}
                ></CatalogueItem>
              ))}
            </ItemWrapper>
          );
        }}
        isLoading={isLoading}
        emptyResultMessage="You are not renting anything yet"
      />
    </ToggleLayout>
  );
};

export default MyFavorites;
