import React, { useMemo } from "react";
import { useUserIsLending } from "../../../hooks/queries/useUserIsLending";
import { Lending } from "../../../types/classes";
import CatalogueLoader from "../../common/catalogue-loader";
import { LendingRow } from "./dashboard-lending-row";

export interface ExtendedLending extends Lending {
  relended: boolean;
}

export const LendingTable: React.FC<{
  checkedItems: Set<string>;
  toggleClaimModal: (b: boolean) => void;
  toggleLendModal: (b: boolean) => void;
  checkBoxChangeWrapped: (nft: Lending) => () => void;
}> = ({
  toggleClaimModal,
  toggleLendModal,
  checkBoxChangeWrapped,
  checkedItems
}) => {
  const { userLending: lendingItems, isLoading } = useUserIsLending();
  const relendedLendingItems: ExtendedLending[] = useMemo(() => {
    if (!lendingItems) return [];
    return lendingItems.map((r) => ({ ...r, relended: false }));
    //TODO:eniko filterClaimed
    //.map(mapAddRelendedField(mapToIds(rentingItems)))
    // .filter(filterClaimed(showClaimed));
  }, [lendingItems]);

  if (isLoading) return <CatalogueLoader />;
  if (relendedLendingItems.length === 0)
    return (
      <div className="text-center text-base text-white font-display py-32 leading-tight">
        You aren&apos;t lending yet.
        <br />
        To start lending, head to the lend tab.
      </div>
    );
  return (
    <div className="mt- px-8">
      <h2>
        <span sr-only="Lending"></span>
        <img src="/assets/Lending-headline.svg" className="h-12" />
      </h2>
      <h3 className="text-lg">
        Here you will find he NFTs that you are lending. These can also be found
        in the Lending tab after you toggle the view.
      </h3>
      <div className="flex flex-col py-4 pt-8">
        
     </div>
    </div>
  );
};
