import React, { useState, useCallback } from "react";
import AvailableToRent from "./components/all-available-to-rent";
import UserCurrentlyRenting from "./components/user-is-renting";
import PageLayout from "../../components/page-layout";

enum RentSpecificity {
  ALL,
  RENTING,
}

export const Rent: React.FC = () => {
  const [specificity, setSpecificiy] = useState<RentSpecificity>(
    RentSpecificity.ALL
  );

  const switchSpecificity = useCallback(() => {
    setSpecificiy((specificity) =>
      specificity === RentSpecificity.ALL
        ? RentSpecificity.RENTING
        : RentSpecificity.ALL
    );
  }, []);

  return (
    <PageLayout
      title={specificity.valueOf() === 0 ? "AVAILABLE TO RENT" : "RENTING"}
      toggleValue={specificity === RentSpecificity.RENTING}
      onSwitch={switchSpecificity}
    >
      {specificity === RentSpecificity.RENTING && <UserCurrentlyRenting />}
      {specificity === RentSpecificity.ALL && <AvailableToRent />}
    </PageLayout>
  );
};

export default React.memo(Rent);
