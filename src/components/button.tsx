import React from "react";

type ButtonProps = {
  handleClick: () => void;
  disabled?: boolean;
  description: string;
};

export const Button: React.FC<ButtonProps> = ({
  disabled,
  handleClick,
  description,
}) => {
  return (
    <button
      className={`nft__button small ${disabled ? "disabled" : ""}`}
      disabled={disabled}
      onClick={handleClick}
    >
      {description}
    </button>
  );
};
