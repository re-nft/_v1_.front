import { injected, walletconnect, walletlink } from "../connectors";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ChainId } from "@uniswap/sdk";

// TODO put into requirements
export const NetworkContextName = "NETWORK";
export interface WalletInfo {
  connector?: AbstractConnector;
  name: string;
  iconName: string;
  description: string;
  href: string | null;
  color: string;
  primary?: true;
  mobile?: true;
  mobileOnly?: true;
}
export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: "Injected",
    // TODO use svg common names
    iconName: "arrow-right",
    description: "Injected web3 provider.",
    href: null,
    color: "#010101",
    primary: true,
  },
  METAMASK: {
    connector: injected,
    name: "MetaMask",
    iconName: "metamask",
    description: "Easy-to-use browser extension.",
    href: null,
    color: "#E8831D",
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: "WalletConnect",
    iconName: "wallet-connect",
    description: "Connect to Trust Wallet, Rainbow Wallet and more...",
    href: null,
    color: "#4196FC",
    mobile: true,
  },
  WALLET_LINK: {
    connector: walletlink,
    name: "Coinbase Wallet",
    iconName: "coinbase",
    description: "Use Coinbase Wallet app on mobile device",
    href: null,
    color: "#315CF5",
  },
  COINBASE_LINK: {
    name: "Open in Coinbase Wallet",
    iconName: "coinbase",
    description: "Open in Coinbase Wallet app.",
    href: "https://go.cb-w.com/mtUDhEZPy1",
    color: "#315CF5",
    mobile: true,
    mobileOnly: true,
  },
};

export const NETWORK_LABELS: { [t: number]: string } = {
  [ChainId.RINKEBY]: "Rinkeby",
  [ChainId.ROPSTEN]: "Ropsten",
  [ChainId.GÖRLI]: "Görli",
  [ChainId.KOVAN]: "Kovan",
  [ChainId.MAINNET]: "Mainnet",
  31337: "Localhost",
};

export const WALLET_VIEWS = {
  OPTIONS: "options",
  OPTIONS_SECONDARY: "options_secondary",
  ACCOUNT: "account",
  PENDING: "pending",
};

export const APP_URL = "app.wallet.something";
