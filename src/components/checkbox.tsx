import { Checkbox as CheckboxMaterial } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import React from "react";
import { CheckedIcon, CheckIcon } from "./checkbox-icon";

type CheckboxProps = {
  handleClick: () => void;
  checked: boolean;
  disabled?: boolean;
};
const style = {
  root: {},
};
const StyledCheckbox = withStyles(style)(CheckboxMaterial);

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  handleClick,
  disabled,
}) => {
  return (
    <>
      <StyledCheckbox
        checked={checked}
        checkedIcon={<CheckedIcon/>}
        icon={<CheckIcon/>}
        onChange={handleClick}
        disableRipple
        disabled={disabled}
      />
    </>
  );
};

export default Checkbox;
