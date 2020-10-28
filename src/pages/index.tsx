import React from "react";
import { UseWalletProvider } from "use-wallet";

// contexts
import { DappProvider } from "../contexts/Dapp";

// components and other
import App from "../components/App";

export default () => {
  return (
    <UseWalletProvider chainId={5}>
      <DappProvider>
        <App />
      </DappProvider>
    </UseWalletProvider>
  );
};
