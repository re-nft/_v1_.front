import React, { useCallback } from "react";
import { classNames } from "../../utils";

type CheckboxProps = {
  onChange: () => void;
  checked: boolean;
  disabled?: boolean;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  disabled,
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
    <div className="checkbox block h-5 relative" onClick={onChangeWrapper}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="block relative top-0 left-0 h-5 w-5 invisible"
        disabled={disabled}
      />
      <span
        className={classNames(
          "checkmark absolute transition duration-200 ease-in-out z-10  ",
          disabled
            ? "bg-rn-grey shadow-rn-drop-grey w-4 h-4 -top-1 -left-1 cursor-not-allowed"
            : checked
            ? "bg-rn-orange shadow-rn-inset-orange w-5 h-5 top-0 left-1"
            : "unchecked w-4 h-4 -top-1 -left-1 hover:bg-rn-orange hover:shadow-rn-drop-orange bg-rn-green shadow-rn-drop-green "
        )}
      ></span>
      <span className="relative block bg-black transition duration-200 ease-in-out h-6 w-6 pointer -top-5"></span>
    </div>
  );
};

export default Checkbox;
