import { TextField } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const fancyStyle = {
  root: {
    margin: '10px 0',
    "& label": {
      color: "#000",
      background: '#eee6f6',
      paddingRight: '12px'
    },
    "& input": {
      color: "#000",
      fontWeight: "400",
      padding: '15px 12px',
    },
    "& label.Mui-focused": {
      color: "#000",
      background: '#eee6f6',
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
