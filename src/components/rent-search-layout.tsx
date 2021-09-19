import React from "react";
import SearchLayout from "./search-layout";
import { useMemo } from "react";

export const RentSearchLayout: React.FC = ({ children }) => {
  const tabs = useMemo(() => {
    return [];
    // return [
    //   {
    //     name: "ALL TO RENT",
    //     href: "/",
    //     current: specificity === RentSpecificity.ALL,
    //   },
    //   {
    //     name: "USER IS RENTING",
    //     href: "/user-is-renting",
    //     current: specificity !== RentSpecificity.ALL,
    //   },
    // ];
  }, []);
  return <SearchLayout tabs={tabs}>{children}</SearchLayout>;
};
