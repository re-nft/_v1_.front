import React from "react";

type CheckboxProps = {
  onChange: () => void;
  checked: boolean;
  disabled?: boolean;
};
const style = {
  root: {
    padding: "0",
    width: "32px",
    height: "32px",
    "& input:disabled + .MuiSvgIcon-root": {
      "& .front": {
        fill: "#9CA3AF",
      },
      "& .shadow": {
        fill: "#4B5563",
      },
    },
  },
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
        // checkedIcon={<CheckedIcon />}
        // icon={<CheckIcon />}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="checkmark"></span>
    </div>
  );
};

export default Checkbox;
