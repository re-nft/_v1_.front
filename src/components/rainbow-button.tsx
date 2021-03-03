import React from "react";

type RainbowButtonProps = {
  text: string;
  type: string;
  disabled: boolean;
};

const RainBowButton: React.FC<RainbowButtonProps> = ({ disabled, text }) => {
  return (
    <button
      type="submit"
      className="rainbow-button"
      disabled={disabled}
      data-text={text}
    />
  );
};

export default RainBowButton;
