import React from "react";
import ToggleLayout from "./toggle-layout";
import { useRouter } from "next/router";
import { useMemo } from "react";

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

  const tabs = useMemo(() => {
    return [
      {
        name: "ALL TO RENT",
        href: "/",
        current: specificity === RentSpecificity.ALL,
      },
      {
        name: "USER IS RENTING",
        href: "/user-is-renting",
        current: specificity !== RentSpecificity.ALL,
      },
    ];
  }, [specificity]);
  return <ToggleLayout tabs={tabs}>{children}</ToggleLayout>;
};
