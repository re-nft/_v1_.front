import React from "react";
import { UseWalletProvider } from "use-wallet";

import App from "../components/App";

export default () => {
  return (
    <UseWalletProvider chainId={5}>
      <App />
    </UseWalletProvider>
  );
};
