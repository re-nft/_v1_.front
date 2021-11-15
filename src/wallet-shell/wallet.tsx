import React, { StrictMode } from "react";
import { Web3ReactProvider } from "@web3-react/core";
import { getLibrary } from "./index";
import { Web3StatusManager } from "./index.manager";
import { Web3StatusProvider } from "./index.provider";
import { URLWarning } from "./components/URLWarning";
import { ApplicationUpdater } from "./updaters/ApplicationUpdater";
import dynamic from "next/dynamic";

const Web3ReactProviderDefault = dynamic(
  () => import("renft-front/wallet-shell/provider"),
  { ssr: false }
);

const WalletWrapper: React.FC = ({ children }) => {
  return (
    <StrictMode>
      <Web3ReactProviderDefault getLibrary={getLibrary}>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Web3StatusProvider>
            <URLWarning />
            <ApplicationUpdater />
            {/* <TransactionUpdater /> */}
            <Web3StatusManager>{children}</Web3StatusManager>
          </Web3StatusProvider>
        </Web3ReactProvider>
      </Web3ReactProviderDefault>
    </StrictMode>
  );
};
export default WalletWrapper;
