import React from "react";
import { UseWalletProvider } from "use-wallet";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

// contexts
import { DappProvider } from "../contexts/Dapp";
import { GanFacesProvider } from "../contexts/GanFaces";
import { ContractsProvider } from "../contexts/Contracts";
import { GraphProvider } from "../contexts/Graph";

// components and other
import App from "../components/App";

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

const Index: React.FC = () => {
  return (
    <UseWalletProvider chainId={5}>
      <DappProvider>
        <ContractsProvider>
          <GraphProvider>
            <GanFacesProvider>
              <ThemeProvider theme={theme}>
                <App />
              </ThemeProvider>
            </GanFacesProvider>
          </GraphProvider>
        </ContractsProvider>
      </DappProvider>
    </UseWalletProvider>
  );
};

export default Index;
