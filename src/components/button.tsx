import React from "react";

type ButtonProps = {
  handleClick: () => void;
  disabled?: boolean;
  description: string;
  datacy?: string
};

export const Button: React.FC<ButtonProps> = ({
  disabled,
  handleClick,
  description,
  datacy
}) => {
  return (
    <button
      className={`nft__button small ${disabled ? "disabled" : ""}`}
      disabled={disabled}
      onClick={handleClick}
      data-cy={datacy}
    >
      {description}
    </button>
  );
};
