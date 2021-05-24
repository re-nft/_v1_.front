import React from "react";
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
import { CurrentAddressContextWrapperProvider } from "./contexts/CurrentAddressContextWrapper";
import { NFTMetaProvider } from "./contexts/NftMetaState";

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
    <CurrentAddressContextWrapperProvider>
      <NFTMetaProvider>
        <GraphProvider>
          <TransactionStateProvider>
            <ThemeProvider theme={theme}>
              <App />
            </ThemeProvider>
          </TransactionStateProvider>
        </GraphProvider>
      </NFTMetaProvider>
    </CurrentAddressContextWrapperProvider>
  </Symfoni>,
  document.getElementById("root")
);
