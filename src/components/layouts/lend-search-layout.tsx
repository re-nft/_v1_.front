import React, { useMemo } from "react";
import SearchLayout from "./search-layout";

export const LendSearchLayout: React.FC<{
  hideDevMenu?: true
}> = ({ children, hideDevMenu }) => {
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
  return <SearchLayout tabs={tabs} hideDevMenu={hideDevMenu}>{children}</SearchLayout>;
};
