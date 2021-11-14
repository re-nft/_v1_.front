import { Web3Provider } from "@ethersproject/providers";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";

import { NetworkConnector } from "./NetworkConnector";

// TODO fix, not loading first time
const NETWORK_URL =
  process.env.NEXT_PUBLIC_PROVIDER_URL || "http://dummy-url-will-throw";
export const NETWORK_CHAIN_ID: number = parseInt(
  process.env.NEXT_PUBLIC_CHAIN_ID ?? "1"
);

export const network = new NetworkConnector({
  urls: { [NETWORK_CHAIN_ID]: NETWORK_URL },
});

let networkLibrary: Web3Provider | undefined;
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary =
    networkLibrary ?? new Web3Provider(network.provider as any));
}

export const injected = new InjectedConnector({
  supportedChainIds: [NETWORK_CHAIN_ID],
});

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: { [NETWORK_CHAIN_ID]: NETWORK_URL },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
});

export const walletlink = new WalletLinkConnector({
  url: NETWORK_URL,
  appName: "ReNFT",
  appLogoUrl: "http://dapps.renft.io/assets/logo.png",
});
