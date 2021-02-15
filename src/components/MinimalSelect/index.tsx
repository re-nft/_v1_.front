import React, { useState } from "react";
import { useMinimalSelectStyles } from "./minimalSelect.styles";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

// Original design here: https://github.com/siriwatknp/mui-treasury/issues/540

const MinimalSelect: React.FC = () => {
  const [val, setVal] = useState(1);

  //@ts-ignore
  const handleChange = (event) => {
    setVal(event.target.value);
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
        value={val}
        onChange={handleChange}
      >
        <MenuItem value={1} disabled>
          Payment Token *
        </MenuItem>
        <MenuItem value={2} style={{ color: "teal", fontWeight: 1000 }}>
          USDC
        </MenuItem>
        <MenuItem value={3} style={{ color: "teal", fontWeight: 1000 }}>
          USDT
        </MenuItem>
        <MenuItem value={4} style={{ color: "teal", fontWeight: 1000 }}>
          DAI
        </MenuItem>
        <MenuItem value={5} style={{ color: "teal", fontWeight: 1000 }}>
          RENT
        </MenuItem>
        <MenuItem value={6} style={{ color: "teal", fontWeight: 1000 }}>
          ETH
        </MenuItem>
        <MenuItem value={7} style={{ color: "teal", fontWeight: 1000 }}>
          WETH
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default MinimalSelect;
