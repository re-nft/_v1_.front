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

const CssTextField = withStyles(fancyStyle)(TextField);

export default CssTextField;
