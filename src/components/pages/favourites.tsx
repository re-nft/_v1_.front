import React, { useCallback, useMemo } from "react";

import { Lending, Renting } from "renft-front/types/classes";
import { CatalogueItem } from "renft-front/components/catalogue-item";
import { useBatchItems } from "renft-front/hooks/misc/useBatchItems";
import { useAllAvailableForRent } from "renft-front/hooks/queries/useAllAvailableForRent";
import SearchLayout from "renft-front/components/layouts/search-layout";
import ItemWrapper from "renft-front/components/common/items-wrapper";
import { PaginationList } from "renft-front/components/layouts/pagination-list";
import { getUniqueID } from "renft-front/utils";
import { useUserData } from "renft-front/hooks/store/useUserData";

export const MyFavorites: React.FC = () => {
  const { allAvailableToRent, isLoading: allAvailableIsLoading } =
    useAllAvailableForRent();
  const { userData, isLoading: userDataIsLoading } = useUserData();
  const { onCheckboxChange } = useBatchItems('favorites');

  const favorites = useMemo(() => {
    if (!allAvailableToRent || !userData || !userData.favorites) return [];
    const m = new Set(Object.keys(userData?.favorites));
    if (m.size < 1) return [];
    return allAvailableToRent.filter((item) => {
      return m.has(getUniqueID(item.nftAddress, item.tokenId));
    });
  }, [allAvailableToRent, userData]);

  const onItemCheck = useCallback(
    (nft) => {
      return () => {
        onCheckboxChange(nft);
      };
    },
    [onCheckboxChange]
  );

  const isLoading = userDataIsLoading || allAvailableIsLoading;

  return (
    <SearchLayout tabs={[]} hideDevMenu>
      <PaginationList
        nfts={favorites}
        emptyResultMessage="You dont have any NFTs added to favourites yet"
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
                    // use null, no need for tracking
                    uniqueId=""
                    isAlreadyFavourited
                    onCheckboxChange={onItemCheck(nft)}
                  ></CatalogueItem>
                )
              )}
            </ItemWrapper>
          );
        }}
        isLoading={isLoading}
      />
    </SearchLayout>
  );
};

export default MyFavorites;
