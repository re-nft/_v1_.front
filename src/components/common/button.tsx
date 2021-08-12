import React from "react";

type ButtonProps = {
  onClick: (e: unknown) => void;
  disabled?: boolean;
  description: string;
  datacy?: string;
};

export const Button: React.FC<ButtonProps> = React.forwardRef(
  ({ disabled, onClick, description, datacy }, ref) => {
    return (
      <button
        //@ts-ignore
        ref={ref}
        className={`nft__button small ${disabled ? "disabled" : ""}`}
        disabled={disabled}
        onClick={onClick}
        data-cy={datacy}
        type="button"
      >
        {description}
      </button>
    );
  }
);
Button.displayName = "Button";
