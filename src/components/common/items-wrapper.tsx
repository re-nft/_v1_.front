import React from "react";

const ItemWrapper: React.FC<{
  flipId?: string | "flip";
}> = ({ children, flipId }) => {
  return (
    <div>
      <div className=" pt-8 grid grid-flow-row justify-items grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-8">
        {children}
      </div>
    </div>
  );
};

export default ItemWrapper;
