import React from "react";
import SearchLayout from "./search-layout";

export const RentSearchLayout: React.FC<{
  hideDevMenu?: true;
  hideSearchMenu?: true
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
