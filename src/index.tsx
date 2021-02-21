import React from "react";
import ReactDOM from "react-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import dotenv from "dotenv";

// pulls the config from .env file
dotenv.config();

import App from "./App";
// import reportWebVitals from "./reportWebVitals";
import { GraphProvider } from "./contexts/Graph";
import { TransactionStateProvider } from "./contexts/TransactionState";
import { Symfoni } from "./hardhat/SymfoniContext";

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
  <React.StrictMode>
    <Symfoni>
      <GraphProvider>
        <TransactionStateProvider>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </TransactionStateProvider>
      </GraphProvider>
    </Symfoni>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
