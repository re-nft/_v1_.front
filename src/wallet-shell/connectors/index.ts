import { Web3Provider } from "@ethersproject/providers";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";

import { NetworkConnector } from "./NetworkConnector";

// TODO fix, not loading first time
const NETWORK_URL = process.env.NEXT_PUBLIC_PROVIDER_URL;
if (typeof NETWORK_URL === "undefined")
  throw Error("Please provide a NEXT_PUBLIC_PROVIDER_URL");
export const NETWORK_CHAIN_ID: number = parseInt(
  process.env.NEXT_PUBLIC_CHAIN_ID ?? "1"
);
// TODO this keep throwing errors
if (process.env && typeof NETWORK_URL === "undefined") {
  throw new Error(
    `REACT_APP_NETWORK_URL must be a defined environment variable`
  );
}
export const network = new NetworkConnector({
  urls: { [NETWORK_CHAIN_ID]: NETWORK_URL },
});

let networkLibrary: Web3Provider | undefined;
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary =
    networkLibrary ?? new Web3Provider(network.provider as any));
}

//TODO make this to support only deployed network
export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 31337, 1337],
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
