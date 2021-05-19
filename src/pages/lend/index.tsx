import React, { useState, useCallback } from "react";
import AvailableToLend from "./components/all-available-to-lend";
import UserCurrentlyLending from "./components/user-is-lending";
import PageLayout from "../../components/page-layout";

enum LendSpecificity {
  ALL,
  LENDING,
}

export const Lend: React.FC = () => {
  const [specificity, setSpecificiy] = useState<LendSpecificity>(
    LendSpecificity.ALL
  );

  const switchSpecificity = useCallback(() => {
    setSpecificiy((specificity) =>
      specificity === LendSpecificity.ALL
        ? LendSpecificity.LENDING
        : LendSpecificity.ALL
    );
  }, []);

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
