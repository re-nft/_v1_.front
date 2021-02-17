import { TextField } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const fancyStyle = {
  root: {
    "& label": {
      color: "teal",
    },
    "& input": {
      color: "teal",
      fontWeight: "1000",
    },
    // "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
    //   transform: "translate(14px, -4px) scale(0.55)",
    // },
    "& label.Mui-focused": {
      color: "white",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "black",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "black",
        border: "2px solid black",
      },
      "&:hover fieldset": {
        borderColor: "black",
      },
      "&.Mui-focused fieldset": {
        borderColor: "black",
      },
    },
  },
};

const CssTextField = withStyles(
  fancyStyle, // ! webpack messes around with jss precedence:
  // ! https://stackoverflow.com/questions/62473898/material-ui-rendering-bugs-in-production-build
  // ! so prod wouldn't have styles
  { index: 1 }
)(TextField);

export default CssTextField;
