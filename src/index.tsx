import React from "react";
import ReactDOM from "react-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import dotenv from "dotenv";
import { ReactQueryDevtools } from "react-query-devtools";

dotenv.config();

import App from "./components/app-layout";
import { GraphProvider } from "./contexts/graph/index";
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
  <Symfoni>
    <GraphProvider>
      <TransactionStateProvider>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </TransactionStateProvider>
    </GraphProvider>
    <ReactQueryDevtools />
  </Symfoni>,
  document.getElementById("root")
);
