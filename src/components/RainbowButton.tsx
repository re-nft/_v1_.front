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
    <button type="submit" className="rainbow-button" disabled={disabled}>
      {text}
    </button>
  );
};

export default RainBowButton;
