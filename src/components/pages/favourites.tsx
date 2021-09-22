import React, { useCallback, useMemo } from "react";

import CatalogueLoader from "../common/catalogue-loader";
import { Lending, Renting } from "../../types/classes";
import { CatalogueItem } from "../catalogue-item";
import { useBatchItems } from "../../hooks/misc/useBatchItems";
import { useAllAvailableForRent } from "../../hooks/queries/useAllAvailableForRent";
import SearchLayout from "../layouts/search-layout";
import ItemWrapper from "../common/items-wrapper";
import { PaginationList } from "../layouts/pagination-list";
import { getUniqueID } from "../../utils";
import { useUserData } from "../../hooks/store/useUserData";

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
    <SearchLayout tabs={[]}>
      <PaginationList
        nfts={favorites}
        ItemsRenderer={({ currentPage }) => {
          return (
            <ItemWrapper>
              {currentPage.map(
                (
                  nft:
                    | (Renting & { show: boolean })
                    | (Lending & { show: boolean })
                ) => (
                  <CatalogueItem
                    show={nft.show}
                    key={nft.id}
                    nId={nft.nId}
                    isAlreadyFavourited
                    onCheckboxChange={checkBoxChangeWrapped(nft)}
                  ></CatalogueItem>
                )
              )}
            </ItemWrapper>
          );
        }}
        isLoading={isLoading}
        emptyResultMessage="You are not renting anything yet"
      />
    </SearchLayout>
  );
};

export default MyFavorites;
