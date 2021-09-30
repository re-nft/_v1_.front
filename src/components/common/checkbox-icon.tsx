import React from "react";

export const CheckIcon: React.FC = (props) => {
  return (
    <svg viewBox="0 0 32 32" {...props}>
      <g id="Layer_2" data-name="Layer 2">
        <g id="Layer_1-2" data-name="Layer 1">
          <rect fill={"#36cba5"} width="25" height="25" className="front" />
          <polygon
            fill={"#299b7c"}
            points="25 25 0 25 6.74 32 32 32 25 25"
            className="shadow"
          />
          <polygon
            fill={"#299b7c"}
            points="32 6.74 32 32 25 25 25 0 32 6.74"
            className="shadow"
          />
        </g>
      </g>
    </svg>
  );
};

export const CheckedIcon: React.FC = (props) => {
  return (
    <svg viewBox="0 0 32 32" {...props}>
      <g id="Layer_2" data-name="Layer 2">
        <g id="Layer_1-2" data-name="Layer 1">
          <rect fill={"#fc9706"} width="25" height="25" />
          <polygon fill={"#DF732C"} points="25 25 0 25 6.74 32 32 32 25 25" />
          <polygon fill={"#DF732C"} points="32 6.74 32 32 25 25 25 0 32 6.74" />
        </g>
      </g>
    </svg>
  );
};
