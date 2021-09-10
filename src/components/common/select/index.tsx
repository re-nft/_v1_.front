import React from "react";
import { useMinimalSelectStyles } from "./minimalSelect.styles";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
//@ts-ignore
import { PaymentToken } from "@renft/sdk";

// Original design here: https://github.com/siriwatknp/mui-treasury/issues/540

type MinimalSelectProps = {
  selectedValue: number;
  name: string;
  handleChange: {
    (e: React.ChangeEvent<unknown>): void;
    <T = string | React.ChangeEvent<unknown>>(
      field: T
    ): T extends React.ChangeEvent<unknown>
      ? void
      : (e: string | React.ChangeEvent<unknown>) => void;
  };
  disabled?: boolean
};

const MinimalSelect: React.FC<MinimalSelectProps> = ({
  handleChange,
  selectedValue,
  name,
  disabled
}) => {
  const minimalSelectClasses = useMinimalSelectStyles();

  //@ts-ignore
  const iconComponent = (props) => {
    return (
      <ExpandMoreIcon
        className={props.className + " " + minimalSelectClasses.icon}
      />
    );
  };

  // moves the menu below the select input
  const menuProps = {
    classes: {
      paper: minimalSelectClasses.paper,
      list: minimalSelectClasses.list,
    },
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
    getContentAnchorEl: null,
  };

  return (
    <FormControl>
      <Select
        name={name}
        disableUnderline
        classes={{ root: minimalSelectClasses.select }}
        //@ts-ignore
        MenuProps={menuProps}
        IconComponent={iconComponent}
        value={selectedValue}
        onChange={handleChange}
        defaultValue={-1}
        disabled={disabled}
      >
        <MenuItem disabled value={-1}>
          Select Payment Token *
        </MenuItem>
        <MenuItem
          value={PaymentToken.WETH}
          style={{ color: "teal", fontWeight: 1000 }}
        >
          WETH
        </MenuItem>
        <MenuItem
          value={PaymentToken.DAI}
          style={{ color: "teal", fontWeight: 1000 }}
        >
          DAI
        </MenuItem>
        <MenuItem
          value={PaymentToken.USDC}
          style={{ color: "teal", fontWeight: 1000 }}
        >
          USDC
        </MenuItem>
        <MenuItem
          value={PaymentToken.USDT}
          style={{ color: "teal", fontWeight: 1000 }}
        >
          USDT
        </MenuItem>
        <MenuItem
          value={PaymentToken.TUSD}
          style={{ color: "teal", fontWeight: 1000 }}
        >
          TUSD
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default MinimalSelect;
