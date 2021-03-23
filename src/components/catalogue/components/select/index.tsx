import React, { useState } from "react";
import { useMinimalSelectStyles } from "./minimalSelect.styles";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { PaymentToken } from "../../../../types";

// Original design here: https://github.com/siriwatknp/mui-treasury/issues/540

type MinimalSelectProps = {
  onSelect(value: number): void;
  selectedValue: number;
};

const MinimalSelect: React.FC<MinimalSelectProps> = ({
  onSelect,
  selectedValue,
}) => {
  //@ts-ignore
  const handleChange = (event) => {
    const value = event.target.value as PaymentToken;
    onSelect(value);
  };

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
        disableUnderline
        classes={{ root: minimalSelectClasses.select }}
        //@ts-ignore
        MenuProps={menuProps}
        IconComponent={iconComponent}
        value={selectedValue}
        onChange={handleChange}
        defaultValue={-1}
      >
        <MenuItem disabled value={-1}>Select Payment Token *</MenuItem>
        <MenuItem
          value={PaymentToken.ETH}
          style={{ color: "teal", fontWeight: 1000 }}
        >
          ETH
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
