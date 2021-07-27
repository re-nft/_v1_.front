import { Checkbox as CheckboxMaterial } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import React from "react";
import { CheckedIcon, CheckIcon } from "./checkbox-icon";

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
const StyledCheckbox = withStyles(style)(CheckboxMaterial);

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  disabled,
}) => {
  return (
    <StyledCheckbox
      checked={checked}
      checkedIcon={<CheckedIcon />}
      icon={<CheckIcon />}
      onChange={onChange}
      disableRipple
      disabled={disabled}
      size="medium"
    />
  );
};

export default Checkbox;
