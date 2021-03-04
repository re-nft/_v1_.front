import React, { useState, useCallback } from "react";
import Lending from "../catalogue/lend/lendings";
import UserLending from "../catalogue/lend/user-lendings";
import PageLayout from "../layout/page-layout";

type LendProps = {
  hidden: boolean;
};

enum LendSpecificity {
  ALL,
  LENDING,
}

export const Lend: React.FC<LendProps> = ({ hidden }) => {
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

  // TODO: wtf?
  if (hidden) return <></>;

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

export default Lend;
