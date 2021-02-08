import React from "react";

type RainbowButtonProps = {
  text: string;
  type: string;
  disabled: boolean;
};

const RainBowButton: React.FC<RainbowButtonProps> = ({ disabled }) => {
  return (
    <button
      type="submit"
      className="rainbow-button"
      disabled={disabled}
      data-text="LEND"
    />
  );
};

export default RainBowButton;
