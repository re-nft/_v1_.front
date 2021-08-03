import React from "react";

const ItemWrapper: React.FC = ({ children }) => {
  return <div className="content__row content__items">{children}</div>;
};



export default ItemWrapper;
