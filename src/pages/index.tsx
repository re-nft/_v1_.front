import React from "react";
import { UseWalletProvider } from "use-wallet";

// contexts
import { DappProvider } from "../contexts/Dapp";
import { GanFacesProvider } from "../contexts/GanFaces";
import { ContractsProvider } from "../contexts/Contracts";

// components and other
import App from "../components/App";

export default () => {
  return (
    <UseWalletProvider chainId={5}>
      <DappProvider>
        <ContractsProvider>
          <GanFacesProvider>
            <App />
          </GanFacesProvider>
        </ContractsProvider>
      </DappProvider>
    </UseWalletProvider>
  );
};
