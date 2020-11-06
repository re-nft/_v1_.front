import { TextField } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const CssTextField = withStyles({
  root: {
    "& label": {
      color: "white",
      fontFamily: "Righteous, consolas, Menlo, monospace, sans-serif",
    },
    "& input": {
      color: "teal",
      fontFamily: "Righteous, consolas, Menlo, monospace, sans-serif",
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

export default CssTextField;
