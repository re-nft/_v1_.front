// import { Checkbox as CheckboxMaterial } from "@material-ui/core";
// import { withStyles } from "@material-ui/core/styles";
import React from "react";

type CheckboxProps = {
  handleClick: () => void;
  checked: boolean;
  disabled?: boolean;
};
const style = {
  root: {},
};
// const StyledCheckbox = withStyles(style)(CheckboxMaterial);

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  handleClick
}) => {
  return (
    <>
      <div
        onClick={handleClick}
        className={`checkbox__dashboard checkbox ${checked ? "checked" : ""}`}
      />
      {/* <StyledCheckbox checked={checked} onChange={handleClick} disableRipple /> */}
    </>
  );
};

export default Checkbox;
