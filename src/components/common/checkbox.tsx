import React, { useCallback } from "react";
import type { ReactEventOnChangeType } from "renft-front/types";
import { classNames } from "renft-front/utils";

type CheckboxProps = {
  onChange: ReactEventOnChangeType;
  checked: boolean;
  disabled?: boolean;
  label: string;
  srOnly?: boolean;
  ariaLabel: string;
  id: string;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  disabled,
  label,
  id,
  ariaLabel,
  srOnly = true,
}) => {
  const cb: ReactEventOnChangeType = useCallback(
    (e: React.ChangeEvent<unknown>) => {
      if (disabled) return;
      onChange(e);
    },
    [onChange, disabled]
  );
  return (
    <>
      <div className="flex items-center h-5">
        <input
          id={`checkbox-${id}`}
          aria-describedby={ariaLabel}
          type="checkbox"
          checked={checked}
          onChange={cb}
          disabled={disabled}
          className={classNames(
            disabled && "cursor-not-allowed border-gray-300",
            "focus:ring-rn-green h-5 w-5 text-rn-green border-black border-2"
          )}
        />
      </div>
      <div className={srOnly ? "sr-only ml-3 text-sm" : "ml-3 text-sm"}>
        <label htmlFor={`checkbox-${id}`} className="font-medium text-gray-700">
          {label}
        </label>
      </div>
    </>
  );
};

export default Checkbox;
