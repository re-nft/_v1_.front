import { TextField } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const fancyStyle = {
  root: {
    width: "120px",
    "& label": {
      color: "#000",
      background: "#eee6f6",
      paddingRight: "12px",
      display: "none",
    },
    "& input": {
      color: "#fff",
      fontWeight: "400",
      fontSize: "24px",
      padding: '0',
      textAlign: 'end'
    },
    "& label.Mui-focused": {
      color: "#fff",
      background: "#eee6f6",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#fff",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#fff",
        border: "2px solid #fff",
      },
      "&:hover fieldset": {
        borderColor: "#fff",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#fff",
      },
    },
    "& .MuiInputAdornment-root": {
      fontSize: "24px",
      color: "#fff",
    },
  },
};

const PaginationTextField = withStyles(fancyStyle)(TextField);

export default PaginationTextField;
