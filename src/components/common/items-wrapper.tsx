import React from "react";
import { Flipper } from "react-flip-toolkit";

const ItemWrapper: React.FC<{
  flipId?: string | "flip";
}> = ({ children, flipId }) => {
  return (
    <Flipper
      flipKey={flipId}
      spring="wobbly"
      staggerConfig={{
        default: {
          speed: 0.2,
        },
      }}
      decisionData={{
        stagger: "forward",
        spring: "wobble",
      }}
    >
      <div className=" pt-8 grid grid-cols-4 gap-6 px-8">{children}</div>
    </Flipper>
  );
};

export default ItemWrapper;
