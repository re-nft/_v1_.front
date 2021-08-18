import React, { useContext } from "react";
import { SnackAlertContext } from "../../contexts/SnackProvider";

export const SnackAlert: React.FC = () => {
  const {
    hideError: closeAlert,
    errorIsShown: open,
    message,
    type,
  } = useContext(SnackAlertContext);

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    closeAlert();
  };
  // TODO class based on type
  return (
    <div>
      {open && (
        <div>
          <div onClick={handleClose}>X</div>
          {message}
        </div>
      )}
    </div>
  );
};
