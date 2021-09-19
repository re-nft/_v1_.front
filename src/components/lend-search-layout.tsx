import React, { useMemo } from "react";
import ToggleLayout from "./toggle-layout";

export const LendSearchLayout: React.FC = ({ children }) => {
  const tabs = useMemo(() => {
    return [];
    // return [
    //   {
    //     name: "ALL TO LEND",
    //     href: "/lend",
    //     current: specificity === LendSpecificity.ALL,
    //   },
    //   {
    //     name: "USER IS LENDING",
    //     href: "/user-is-lending",
    //     current: specificity !== LendSpecificity.ALL,
    //   },
    // ];
  }, []);
  return <ToggleLayout tabs={tabs}>{children}</ToggleLayout>;
};
