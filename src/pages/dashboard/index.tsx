import React, { useState, useCallback, useContext, useMemo } from "react";

import {
  useBatchItems
} from "../../controller/batch-controller";
import CatalogueLoader from "../../components/catalogue-loader";
import { CurrentAddressWrapper } from "../../contexts/CurrentAddressWrapper";
import { UserLendingContext } from "../../contexts/UserLending";
import { UserRentingContext } from "../../contexts/UserRenting";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import UserContext from "../../contexts/UserProvider";
import { Toggle } from "../../components/common/toggle";
import { ExtendedLending, LendingTable } from "./lending-table";
import { ExtendedRenting, RentingTable } from "./renting-table";
import { DashboardBatch } from "./dashboard-batch";
import { mapAddRelendedField, mapToIds, filterClaimed } from "../../utils";

enum DashboardViewType {
  LIST_VIEW,
  MINIATURE_VIEW
}

export const Dashboard: React.FC = () => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { signer } = useContext(UserContext);
  const [isClaimModalOpen, toggleClaimModal] = useState(false);
  const [isLendModalOpen, toggleLendModal] = useState(false);
  const [isReturnModalOpen, toggleReturnModal] = useState(false);
  const [showClaimed, toggleClaimed] = useState(true);

  const {
    onCheckboxChange,
    handleResetLending,
    handleResetRenting,
    checkedItems,
    checkedLendingItems,
    checkedRentingItems,
    checkedClaims
  } = useBatchItems();
  const { userRenting: rentingItems, isLoading: userRentingLoading } =
    useContext(UserRentingContext);
  const { userLending: lendingItems, isLoading: userLendingLoading } =
    useContext(UserLendingContext);
  const [viewType, _] = useState<DashboardViewType>(
    DashboardViewType.LIST_VIEW
  );

  const isLoading = userLendingLoading || userRentingLoading;

  const relendedLendingItems: ExtendedLending[] = useMemo(() => {
    if (!rentingItems) return [];
    return lendingItems
      .map(mapAddRelendedField(mapToIds(rentingItems)))
      .filter(filterClaimed(showClaimed));
  }, [lendingItems, rentingItems, showClaimed]);

  //@ts-ignore
  const relendedRentingItems: ExtendedRenting[] = useMemo(() => {
    if (!rentingItems) return [];
    return rentingItems
      .map(mapAddRelendedField(mapToIds(lendingItems)))
      .filter(filterClaimed(showClaimed));
  }, [lendingItems, rentingItems, showClaimed]);


  const checkBoxChangeWrapped = useCallback(
    (nft) => {
      return () => {
        onCheckboxChange(nft);
      };
    },
    [onCheckboxChange]
  );

  const toggleClaimSwitch = useCallback(() => {
    toggleClaimed(!showClaimed);
  }, [showClaimed]);

  const toggleTitle = useMemo(() => {
    return showClaimed ? "Hide claimed items" : "Show claimed items";
  }, [showClaimed]);

  if (!signer) {
    return (
      <div className="center content__message">Please connect your wallet!</div>
    );
  }

  if (isLoading && lendingItems.length === 0 && rentingItems.length === 0)
    return <CatalogueLoader />;

  if (!isLoading && lendingItems.length === 0 && rentingItems.length === 0) {
    return (
      <div className="center content__message">
        You aren&apos;t lending or renting yet. To start lending, head to the
        lend tab.
      </div>
    );
  }

  return (
    <div>
      {viewType === DashboardViewType.LIST_VIEW && (
        <div className="dashboard-list-view">
          <Toggle
            toggleValue={showClaimed}
            onSwitch={toggleClaimSwitch}
            title={toggleTitle}
          />
          <LendingTable
            checkedItems={checkedItems}
            toggleClaimModal={toggleClaimModal}
            toggleLendModal={toggleLendModal}
            checkBoxChangeWrapped={checkBoxChangeWrapped}
            lendingItems={relendedLendingItems}
          />
          <RentingTable
            checkedItems={checkedItems}
            toggleReturnModal={toggleReturnModal}
            checkBoxChangeWrapped={checkBoxChangeWrapped}
            rentingItems={relendedRentingItems}
            currentAddress={currentAddress}
          />
        </div>
      )}
      <DashboardBatch
        isReturnModalOpen={isReturnModalOpen}
        checkedRentingItems={checkedRentingItems}
        toggleReturnModal={toggleReturnModal}
        handleResetRenting={handleResetRenting}
        isLendModalOpen={isLendModalOpen}
        checkedLendingItems={checkedLendingItems}
        toggleLendModal={toggleLendModal}
        handleResetLending={handleResetLending}
        isClaimModalOpen={isClaimModalOpen}
        checkedClaims={checkedClaims}
        toggleClaimModal={toggleClaimModal}
      />
    </div>
  );
};

// this keeps rerendering

export default React.memo(Dashboard);
