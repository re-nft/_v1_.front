import React from "react";
import { ReactEventOnClickType } from "../../types";
import { classNames } from "../../utils";

type ButtonProps = {
  onClick: ReactEventOnClickType;
  disabled?: boolean;
  description: string;
  datacy?: string;
  type?: 'submit' | 'button'
};

export const Button: React.FC<ButtonProps> = React.forwardRef(
  ({ disabled, onClick, description, datacy, type="button" }, ref) => {
    return (
      <button
        //@ts-ignore
        ref={ref}
        className={`relative outline-none block p-1 bg-black ${
          disabled ? "cursor-not-allowed" : ""
        }`}
        disabled={disabled}
        onClick={onClick}
        data-cy={datacy}
        type={type}
      >
        <div
          className={classNames(
            "relative py-3 px-4 bg-rn-green shadow-rn-drop-green text-white leading-none font-display uppercase text-sm whitespace-nowrap -top-2 -left-2",
            disabled
              ? "bg-rn-grey shadow-rn-drop-grey"
              : "hover:bg-rn-orange hover:shadow-rn-drop-orange"
          )}
        >
          {description}
        </div>
      </button>
    );
  }
);
Button.displayName = "Button";
