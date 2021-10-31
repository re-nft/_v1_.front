import React from "react";
import SearchLayout from "./search-layout";

export const LendSearchLayout: React.FC<{
  hideDevMenu?: true;
}> = ({ children, hideDevMenu, hideSearchMenu }) => {
  return (
    <SearchLayout
      tabs={[]}
      hideDevMenu={hideDevMenu}
      hideSearchMenu={hideSearchMenu}
    >
      {children}
    </SearchLayout>
  );
};
