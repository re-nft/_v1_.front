import React from "react";
import ReactDOM from "react-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import dotenv from "dotenv";
import { ReactQueryDevtools } from "react-query/devtools";
import { QueryClient, QueryClientProvider } from "react-query";

dotenv.config();

import App from "./components/app-layout";
import { GraphProvider } from "./contexts/graph/index";
import { TransactionStateProvider } from "./contexts/TransactionState";
import { Symfoni } from "./hardhat/SymfoniContext";
import { CurrentAddressContextWrapperProvider } from "./contexts/CurrentAddressContextWrapper";

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

const queryClient = new QueryClient();

ReactDOM.render(
  <Symfoni>
    <CurrentAddressContextWrapperProvider>
      <GraphProvider>
        <TransactionStateProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
              <App />
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </TransactionStateProvider>
      </GraphProvider>
    </CurrentAddressContextWrapperProvider>
  </Symfoni>,
  document.getElementById("root")
);
