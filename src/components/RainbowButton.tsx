import React from "react";

type RainbowButtonProps = {
  text: string;
};

const RainBowButton: React.FC<RainbowButtonProps> = ({ text }) => {
  return <a href="#" className="rainbow-button" alt={text}></a>;
};

export default RainBowButton;
