import { makeStyles } from "@material-ui/core/styles";
import { deepPurple } from "@material-ui/core/colors";

const minimalSelectStyles = () => ({
  select: {
    minWidth: 200,
    background: "#550099",
    color: "teal",
    fontWeight: 1000,
    // borderStyle: "none",
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 12,
    paddingLeft: 24,
    paddingTop: 14,
    paddingBottom: 15,
    boxShadow: "0px 5px 8px -3px rgba(0,0,0,0.42)",
    "&:focus": {
      borderRadius: 12,
      background: "#550099",
      // borderColor: "black",
      // borderColor: deepPurple[100],
    },
  },
  icon: {
    color: deepPurple[300],
    right: 12,
    position: "absolute",
    userSelect: "none",
    pointerEvents: "none",
  },
  paper: {
    borderRadius: 12,
    marginTop: 8,
  },
  list: {
    paddingTop: 0,
    paddingBottom: 0,
    background: "#550099",
    "& li": {
      fontWeight: 200,
      paddingTop: 12,
      paddingBottom: 12,
    },
    "& li:hover": {
      background: deepPurple[100],
    },
    "& li.Mui-selected": {
      color: "white",
      background: deepPurple[400],
    },
    "& li.Mui-selected:hover": {
      background: deepPurple[500],
    },
  },
});

//@ts-ignore
const useMinimalSelectStyles = makeStyles(minimalSelectStyles, {
  name: "MinimalSelect",
  // ! webpack messes around with jss precedence:
  // ! https://stackoverflow.com/questions/62473898/material-ui-rendering-bugs-in-production-build
  // ! so prod wouldn't have styles
  index: 1,
});

export { useMinimalSelectStyles };
