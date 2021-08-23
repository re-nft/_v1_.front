import React from "react";

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
  return (
    <div className="checkbox-container" onClick={onChange}>
      <input
        type="checkbox"
        checked={checked}
        className="checkbox"
        disabled={disabled}
      />
      <span className="checkmark"></span>
    </div>
  );
};

export default Checkbox;
