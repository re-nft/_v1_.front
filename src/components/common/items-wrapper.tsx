import React from "react";

const ItemWrapper: React.FC = ({ children }) => {
  return (
    <div>
      <div className="content__row content__items">{children}</div>
    </div>
  );
};

export default ItemWrapper;
