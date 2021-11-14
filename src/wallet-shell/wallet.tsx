import React, { StrictMode, Component } from "react";
import { createWeb3ReactRoot, Web3ReactProvider } from "@web3-react/core";
import { getLibrary } from "./index";
import { Web3StatusManager } from "./index.manager";
import { Web3StatusProvider } from "./index.provider";
import { URLWarning } from "./components/URLWarning";
import { ApplicationUpdater } from "./updaters/ApplicationUpdater";

class ErrorBoundaryWeb3ProviderNetwork extends Component<
  Record<string, unknown>,
  { hasError: boolean }
> {
  constructor(props: Record<string, unknown>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }
  render() {
    let Web3ProviderNetwork;
    try {
      Web3ProviderNetwork = createWeb3ReactRoot("NETWORK");
    } catch (e) {
      return <>{this.props.children}</>;
    }
    if (this.state.hasError) {
      return <>{this.props.children}</>;
    }
    return (
      <Web3ProviderNetwork getLibrary={getLibrary}>
        {this.props.children}
      </Web3ProviderNetwork>
    );
  }
}

const WalletWrapper: React.FC = ({ children }) => {
  return (
    <StrictMode>
      <ErrorBoundaryWeb3ProviderNetwork>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Web3StatusProvider>
            <URLWarning />
            <ApplicationUpdater />
            {/* <TransactionUpdater /> */}
            <Web3StatusManager>{children}</Web3StatusManager>
          </Web3StatusProvider>
        </Web3ReactProvider>
      </ErrorBoundaryWeb3ProviderNetwork>
    </StrictMode>
  );
};
export default WalletWrapper;
