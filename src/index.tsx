import React from "react";
import ReactDOM from "react-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import dotenv from "dotenv";
import Debug from "debug";

dotenv.config();

console.log('REACT_APP_ENVIRONMENT ', process.env.REACT_APP_ENVIRONMENT)
if (process.env.REACT_APP_DEBUG) {
  Debug.enable(process.env.REACT_APP_DEBUG);
}
if (IS_PROD && process.env.REACT_APP_ADDRESS) {
  throw Error("Please do not use ADDRESS in PRODUCTION env!");
}
// throw error if required env variable isn't provided
[
  "REACT_APP_RENFT_API",
  "REACT_APP_CORS_PROXY",
  "REACT_APP_OPENSEA_API",
  "REACT_APP_EIP721_API",
  "REACT_APP_EIP1155_API",
  "REACT_APP_FIREBASE_API_KEY",
  "REACT_APP_FIREBASE_AUTH_DOMAIN",
  "REACT_APP_FIREBASE_DATABASE_URL",
  "REACT_APP_FIREBASE_PROJECT_ID",
  "REACT_APP_FIREBASE_STORAGE_BUCKET",
  "REACT_APP_FIREBASE_MESSAGING_SENDERID",
  "REACT_APP_FIREBASE_APP_ID",
].forEach((name) => {
  if (!process.env[name]) {
    throw Error(`Please provide a value for ${name} variable`);
  }
});

import App from "./components/app-layout";
import { StateProvider } from "./contexts/StateProvider";

import { ErrorBoundary } from "react-error-boundary";
import { IS_PROD } from "./consts";

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
