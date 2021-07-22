import React, { useCallback } from "react";
import AvailableToRent from "./components/all-available-to-rent";
import UserCurrentlyRenting from "./components/user-is-renting";
import PageLayout from "../../components/page-layout";
import { useHistory } from "react-router-dom";


export enum RentSpecificity {
  ALL,
  RENTING
}

export const Rent: React.FC<{ specificity: RentSpecificity }> = ({
  specificity
}) => {
  const history = useHistory();

  const switchSpecificity = useCallback(() => {
    if (specificity == RentSpecificity.ALL) {
      history.push("/user-is-renting");
    } else {
      history.push("/");
    }
  }, [specificity]);

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
