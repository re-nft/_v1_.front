import React from "react";

type RainbowButtonProps = {
  text: string;
  type: string;
  disabled: boolean;
};

const RainBowButton: React.FC<RainbowButtonProps> = ({
  text,
  type,
  disabled,
}) => {
  return (
    <button
      type="button"
      className="rainbow-button"
      disabled={disabled}
    ></button>
  );
};

export default RainBowButton;
