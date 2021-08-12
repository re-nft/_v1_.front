import React from "react";
import PageLayout from "./page-layout";
import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";

export enum RentSpecificity {
  ALL,
  RENTING,
}

export const RentSwitchWrapper: React.FC = ({ children }) => {
  const router = useRouter();
  const specificity = useMemo(() => {
    return router.pathname === "/user-is-renting"
      ? RentSpecificity.RENTING
      : RentSpecificity.ALL;
  }, [router.pathname]);

  const switchSpecificity = useCallback(() => {
    if (specificity == RentSpecificity.ALL) {
      router.push("/user-is-renting");
    } else {
      router.push("/");
    }
  }, [specificity, router]);

  return (
    <PageLayout
      title={specificity.valueOf() === 0 ? "AVAILABLE TO RENT" : "RENTING"}
      toggleValue={specificity === RentSpecificity.RENTING}
      onSwitch={switchSpecificity}
    >
      {children}
    </PageLayout>
  );
};
