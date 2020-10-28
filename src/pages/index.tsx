import React from "react";
import { UseWalletProvider } from "use-wallet";

// contexts
import { DappProvider } from "../contexts/Dapp";
import { GanFacesProvider } from "../contexts/GanFaces";
import { ContractsProvider } from "../contexts/Contracts";
import { GraphProvider } from "../contexts/Graph";

// components and other
import App from "../components/App";

export default () => {
  return (
    <UseWalletProvider chainId={5}>
      <DappProvider>
        <GraphProvider>
          <ContractsProvider>
            <GanFacesProvider>
              <App />
            </GanFacesProvider>
          </ContractsProvider>
        </GraphProvider>
      </DappProvider>
    </UseWalletProvider>
  );
};
