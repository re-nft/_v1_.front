import React from 'react';
import ReactDOM from "react-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import dotenv from "dotenv";
import Debug from "debug";

dotenv.config();
Debug.enable(process.env.REACT_APP_DEBUG || "");

import App from "./components/app-layout";
import { GraphProvider } from "./contexts/graph/index";
import { TransactionStateProvider } from "./contexts/TransactionState";
import { Symfoni } from "./hardhat/SymfoniContext";
import { StateProvider } from "./contexts/StateProvider";

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
    <StateProvider>
      <GraphProvider>
        <TransactionStateProvider>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </TransactionStateProvider>
      </GraphProvider>
    </StateProvider>
  </Symfoni>,
  document.getElementById("root")
);
