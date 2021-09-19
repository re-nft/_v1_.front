import React, { useCallback, useMemo } from "react";

import CatalogueLoader from "../components/catalogue-loader";
import { Lending, Nft, Renting } from "../types/classes";
import { CatalogueItem } from "../components/catalogue-item";
import { useBatchItems } from "../hooks/useBatchItems";
import { useAllAvailableForRent } from "../hooks/queries/useAllAvailableForRent";
import ToggleLayout from "../components/toggle-layout";
import ItemWrapper from "../components/common/items-wrapper";
import { PaginationList } from "../components/pagination-list";
import { getUniqueID } from "../utils";
import { useUserData } from "../hooks/queries/useUserData";
import { useNftsStore } from "../hooks/queries/useNftStore";

export const MyFavorites: React.FC = () => {
  const { allAvailableToRent, isLoading: allAvailableIsLoading } =
    useAllAvailableForRent();
  const { userData, isLoading: userDataIsLoading } = useUserData();
  const { onCheckboxChange } = useBatchItems();

  const favorites = useMemo(() => {
    if (!allAvailableToRent || !userData || !userData.favorites) return [];
    const m = new Set(Object.keys(userData?.favorites));
    if (m.size < 1) return [];
    return allAvailableToRent.filter((item) => {
      return m.has(getUniqueID(item.nftAddress, item.tokenId));
    });
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
  const nftsInStore = useNftsStore(
    useCallback((state) => state.nfts, [])
  );
  if (isLoading) {
    return (
      <div className="mx-auto">
        <CatalogueLoader />
      </div>
    );
  }

  if (!isLoading && favorites.length === 0) {
    return (
      <div className="mx-auto text-center text-base text-white font-display py-32 leading-tight">
        You dont have any NFTs added to favourites yet
      </div>
    );
  }
  return (
    <ToggleLayout tabs={[]}>
      <PaginationList
        nfts={favorites}
        ItemsRenderer={({ currentPage }) => {
          return (
            <ItemWrapper flipId={currentPage.map((c) => c.id).join("")}>
              {currentPage.map((nft: Renting | Lending) => (
                <CatalogueItem
                  key={nft.id}
                  nId={nft.nId}
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
