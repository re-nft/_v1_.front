import { Select, TextField } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const CssTextField = withStyles({
  root: {
    "& label": {
      color: "white",
    },
    "& input": {
      color: "teal",
      fontWeight: "1000",
    },
    "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
      transform: "translate(14px, -4px) scale(0.55)",
    },
    "& label.Mui-focused": {
      color: "white",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "white",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "black",
        border: "2px solid black",
      },
      "&:hover fieldset": {
        borderColor: "white",
      },
      "&.Mui-focused fieldset": {
        borderColor: "white",
      },
    },
  },
})(TextField);

// todo: non-default export for speed. fix
export const CssSelect = withStyles({
  root: {
    "& label": {
      color: "white",
    },
    "& input": {
      color: "teal",
      fontWeight: "1000",
    },
    "& .MuiSelect-outlined.MuiSelect-shrink": {
      transform: "translate(14px, -4px) scale(0.55)",
    },
    "& label.Mui-focused": {
      color: "white",
    },
    "& .MuiSelect-underline:after": {
      borderBottomColor: "white",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "black",
        border: "2px solid black",
      },
      "&:hover fieldset": {
        borderColor: "white",
      },
      "&.Mui-focused fieldset": {
        borderColor: "white",
      },
    },
  },
})(Select);

export default CssTextField;
