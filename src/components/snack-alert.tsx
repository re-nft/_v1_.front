import { Snackbar } from "@material-ui/core";
import React, { useContext, useEffect } from "react";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { SnackAlertContext } from "../contexts/SnackProvider";

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export const SnackAlert: React.FC = () => {
  const {
    hideError: closeAlert,
    errorIsShown: open,
    message,
    type,
  } = useContext(SnackAlertContext);

  useEffect(() => {
    console.log(open, message, type)
  }, [message, open, type])
  
  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    closeAlert();
  };
  return (
    <div>
      <Snackbar open={open}>
        <Alert onClose={handleClose} severity={type}>
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
};
