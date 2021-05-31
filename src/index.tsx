import React from "react";
import ReactDOM from "react-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import dotenv from "dotenv";
import Debug from "debug";

dotenv.config();

if (process.env.REACT_APP_DEBUG) {
  console.log("debug enabled", process.env.REACT_APP_DEBUG);
  Debug.enable(process.env.REACT_APP_DEBUG);
}

import App from "./components/app-layout";
import { StateProvider } from "./contexts/StateProvider";

import { ErrorBoundary } from "react-error-boundary";

const ErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
  return (
    <div>
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Click to refresh</button>
    </div>
  );
};

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      "Righteous",
      "consolas",
      "Menlo",
      "monospace",
      "sans-serif",
    ].join(","),
  },
});

ReactDOM.render(
  <StateProvider>
    <ThemeProvider theme={theme}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // TODO we will do something better, refresh for now
          window.location.reload();
        }}
      >
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  </StateProvider>,
  document.getElementById("root")
);
