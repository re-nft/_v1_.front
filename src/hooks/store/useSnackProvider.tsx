import { useCallback } from "react";
import produce from "immer";
import shallow from "zustand/shallow";
import create from "zustand";

export type ErrorType = "error" | "success" | "warning" | "info";
export type SnackAlertType = {
  type: ErrorType;
  message: string;
  errorIsShown: boolean;
  setErrorShown: (b: boolean) => void;
  setError: (message: string, type: ErrorType) => void;
  setErrorType: (type: ErrorType) => void;
  setMessage: (message: string) => void;
};

const useSnackProviderState = create<SnackAlertType>((set) => ({
  type: "info",
  message: "",
  errorIsShown: false,
  setErrorShown: (b: boolean) =>
    set(
      produce((state: SnackAlertType) => {
        state.errorIsShown = b;
      })
    ),
  setMessage: (m: string) =>
    set(
      produce((state: SnackAlertType) => {
        state.message = m;
      })
    ),
  setErrorType: (e: ErrorType) =>
    set(
      produce((state: SnackAlertType) => {
        state.type = e;
      })
    ),
  setError: (message: string, type: ErrorType) =>
    set(
      produce((state: SnackAlertType) => {
        state.message = message;
        state.type = type;
      })
    ),
}));

export const useSnackProvider = (): {
  message: string;
  errorIsShown: boolean;
  type: ErrorType,
  hideError: () => void,
  setError: (message: string, type: ErrorType) => void,
} => {
  const errorIsShown = useSnackProviderState(
    useCallback((state) => state.errorIsShown, []),
    shallow
  );
  const type = useSnackProviderState(
    useCallback((state) => state.type, []),
    shallow
  );
  const message = useSnackProviderState(
    useCallback((state) => state.message, []),
    shallow
  );
  const setErrorType = useSnackProviderState(useCallback((state) => state.setErrorType, []));
  const setErrorShown = useSnackProviderState(useCallback((state) => state.setErrorShown, []));
  const setErrorMessage = useSnackProviderState(useCallback((state) => state.setMessage, []));
  const hideError = useCallback(() => {
    setErrorShown(false);
  }, [setErrorShown]);

  const setError = useCallback(
    (message: string, type: ErrorType) => {
      const validMessages = [
        // Tuple, first one is old matched message, second string is new message shown to user
        [
          "execution reverted: ERC20: transfer amount exceeds balance",
          "Insufficient fund. Please check your balance.",
        ],
        ["Transaction is not successful!", "Transaction is not successful!"],
        ["Transaction is success!", "Transaction is success!"],
        [
          "User denied transaction signature.",
          "User denied transaction signature.",
        ],
        ["Link copied to the clipboard ", ""],
      ];
      const contains = validMessages
        .filter(([m]) => message.indexOf(m) > -1)
        .map(([, newMessage]) => newMessage || message);
      if (contains.length > 0) {
        setErrorShown(true);
        setErrorMessage(contains[0]);
        setErrorType(type);
      } else {
        setErrorShown(true);
        setErrorMessage("Something went wrong. Please try again!");
        setErrorType("error");
      }
    },
    [setErrorShown, setErrorMessage, setErrorType]
  );

  return {
    message,
    errorIsShown,
    type,
    hideError,
    setError,
  };
};
