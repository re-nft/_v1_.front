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
      type={type}
      href="#"
      className="rainbow-button"
      alt={text}
      disabled={disabled}
    ></button>
  );
};

export default RainBowButton;
