import { Select, TextField } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const fancyStyle = {
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
};

const CssTextField = withStyles(fancyStyle)(TextField);
export const CssSelect = withStyles(fancyStyle)(Select);

export default CssTextField;
