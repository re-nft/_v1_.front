import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(
  {
    form: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
    },
    inputs: {
      display: "flex",
      flexDirection: "column",
      padding: "32px",
      // matches direct div children of inputs
      "& > div": {
        marginBottom: "16px",
      },
      margin: "0 auto",
    },
    buttons: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
    },
  }, // ! webpack messes around with jss precedence:
  // ! https://stackoverflow.com/questions/62473898/material-ui-rendering-bugs-in-production-build
  // ! so prod wouldn't have styles
  { index: 1 }
);
