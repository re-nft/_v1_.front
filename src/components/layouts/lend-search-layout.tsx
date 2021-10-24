import React from "react";
import SearchLayout from "./search-layout";

export const LendSearchLayout: React.FC<{
  hideDevMenu?: true;
}> = ({ children, hideDevMenu }) => {
  return (
    <SearchLayout tabs={[]} hideDevMenu={hideDevMenu}>
      {children}
    </SearchLayout>
  );
};
