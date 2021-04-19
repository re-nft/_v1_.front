import React, { useState, useCallback } from "react";
import Lending from "./components/lendings";
import UserLending from "./components/user-lendings";
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
      title={specificity.valueOf() === 0 ? "AVAILABLE TO LEND" : "LENDING"}
      toggleValue={specificity === LendSpecificity.LENDING}
      onSwitch={switchSpecificity}
    >
      {specificity === LendSpecificity.LENDING && <UserLending />}
      {specificity === LendSpecificity.ALL && <Lending />}
    </PageLayout>
  );
};

export default React.memo(Lend);
