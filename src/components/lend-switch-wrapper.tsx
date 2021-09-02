import React, { useMemo } from "react";
import ToggleLayout from "./toggle-layout";
import { useRouter } from "next/router";

export enum LendSpecificity {
  ALL,
  LENDING,
}

export const LendSwitchWrapper: React.FC = ({ children }) => {
  const router = useRouter();
  const specificity = useMemo(() => {
    return router.pathname === "/user-is-lending"
      ? LendSpecificity.LENDING
      : LendSpecificity.ALL;
  }, [router.pathname]);

  const tabs = useMemo(() => {
    return [
      {
        name: "ALL TO LEND",
        href: "/lend",
        current: specificity === LendSpecificity.ALL,
      },
      {
        name: "USER IS LENDING",
        href: "/user-is-lending",
        current: specificity !== LendSpecificity.ALL,
      },
    ];
  }, [specificity]);
  return <ToggleLayout tabs={tabs}>{children}</ToggleLayout>;
};
