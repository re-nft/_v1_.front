import { makeStyles } from "@material-ui/core/styles";
import { deepPurple } from "@material-ui/core/colors";

const minimalSelectStyles = () => ({
  select: {
    minWidth: 200,
    background: "#eee6f6",
    color: "#000",
    fontWeight: 1000,
    // borderStyle: "none",
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 4,
    paddingLeft: 24,
    paddingTop: 14,
    paddingBottom: 15,
    border: "3px solid #996fc8",
    "&:focus": {
      borderRadius: 4,
      background: "#eee6f6",
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
    borderRadius: 4,
    marginTop: 8,
  },
  list: {
    paddingTop: 0,
    paddingBottom: 0,
    background: "#eee6f6",
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
});

export { useMinimalSelectStyles };
