import React, { Ref } from "react";
import type { ReactEventOnClickType } from "renft-front/types";
import { classNames } from "renft-front/utils";

type ButtonProps = {
  onClick: ReactEventOnClickType;
  disabled?: boolean;
  description: string;
  datacy?: string;
  type?: "submit" | "button";
  id?: string;
};

export const Button: React.FC<ButtonProps> = React.forwardRef(
  (
    { disabled, onClick, description, datacy, type = "button", ...rest },
    ref: Ref<HTMLButtonElement>
  ) => {
    return (
      <button
        {...rest}
        ref={ref}
        className={classNames(
          "py-2 px-2 tracking-widest bg-rn-green shadow-rn-drop-green text-white leading-none font-display uppercase text-sm whitespace-nowrap -top-2 -left-2",
          disabled
            ? "bg-rn-grey shadow-rn-drop-grey cursor-not-allowed"
            : "hover:bg-rn-orange hover:shadow-rn-drop-orange"
        )}
        disabled={disabled}
        onClick={onClick}
        data-cy={datacy}
        type={type}
      >
        {description}
      </button>
    );
  }
);
Button.displayName = "Button";
