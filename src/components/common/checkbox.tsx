import React, { useCallback } from "react";

type CheckboxProps = {
  onChange: () => void;
  checked: boolean;
  disabled?: boolean;
  label: string;
  srOnly?: boolean
  ariaLabel: string
};

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  disabled,
  label,
  srOnly = true,
  ariaLabel
}) => {
  const onChangeWrapper = useCallback(
    (...args) => {
      if (disabled) return;
      //@ts-ignore
      onChange(args);
    },
    [onChange, disabled]
  );

  return (
    <>
      <div className="flex items-center h-5">
        <input
          aria-describedby={ariaLabel}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="focus:ring-rn-green h-5 w-5 text-rn-green border-black border-2"
        />
      </div>
      <div className={srOnly? "sr-only ml-3 text-sm": "ml-3 text-sm"}>
        <label htmlFor="comments" className="font-medium text-gray-700">
          {label}
        </label>
      </div>
    </>
  );
};

export default Checkbox;
