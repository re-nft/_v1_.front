import React, { useCallback, useMemo } from "react";
import PageLayout from "./page-layout";
import { useRouter } from "next/router";

export enum LendSpecificity {
  ALL,
  LENDING
}

export const LendSwitchWrapper: React.FC = ({ children }) => {
  const router = useRouter();
  const specificity = useMemo(() => {
    return router.pathname === "/user-is-lending"
      ? LendSpecificity.LENDING
      : LendSpecificity.ALL;
  }, [router.pathname]);
  const switchSpecificity = useCallback(() => {
    if (specificity == LendSpecificity.ALL) {
      router.push("/user-is-lending");
    } else {
      router.push("/lend");
    }
  }, [specificity, router]);

  return (
    <PageLayout
      title={
        specificity === LendSpecificity.ALL ? "AVAILABLE TO LEND" : "LENDING"
      }
      toggleValue={specificity === LendSpecificity.LENDING}
      onSwitch={switchSpecificity}
    >
      {children}
    </PageLayout>
  );
};
