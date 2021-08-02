import { Select, withStyles } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";

export const CategorySelect = withStyles({
  root: {
    color: "black",
    padding: "10px",
    border: "3px solid black",
    width: "10rem",
    fontFamily: "VT323",
    fontSize: "14px"
  },
  label: {
    fontFamily: "VT323",
    fontSize: "14px",
    color: "black",
    display: "none"
  },
  select: {
    width: '180px'
  }
})(Select);

export const CategoryMenuItem = withStyles({
  root: {
    fontFamily: "VT323",
    fontSize: "14px",
    "&:hover": {
      background: "black",
      color: 'white'
    }
  },
  selected: {
    color: "white !important",
    background: 'black !important',
    "&:hover": {
      background: "black !important",
      color: 'white !important'
    }
  }
})(MenuItem)