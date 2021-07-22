import React, { useCallback } from "react";
import AvailableToLend from "./components/all-available-to-lend";
import UserCurrentlyLending from "./components/user-is-lending";
import PageLayout from "../../components/page-layout";
import { useHistory } from "react-router-dom";


export enum LendSpecificity {
  ALL,
  LENDING
}

export const Lend: React.FC<{
  specificity: LendSpecificity;
}> = ({ specificity }) => {
  const history = useHistory();

  const switchSpecificity = useCallback(() => {
    if (specificity == LendSpecificity.ALL) {
      history.push("/user-is-lending");
    } else {
      history.push("/lend");
    }
  }, [specificity]);

  return (
    <PageLayout
      title={
        specificity === LendSpecificity.ALL ? "AVAILABLE TO LEND" : "LENDING"
      }
      toggleValue={specificity === LendSpecificity.LENDING}
      onSwitch={switchSpecificity}
    >
      {specificity === LendSpecificity.LENDING && <UserCurrentlyLending />}
      {specificity === LendSpecificity.ALL && <AvailableToLend />}
    </PageLayout>
  );
};

export default React.memo(Lend);
