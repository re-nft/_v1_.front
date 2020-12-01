import React, { createContext, useEffect, useState, useCallback } from "react";
import { useWallet, Wallet } from "use-wallet";
import Web3 from "web3";

import { THROWS } from "../utils";
import { getAll } from "../contracts";
import {
  NetworkSpecificAbis,
  NetworkSpecificAddresses,
} from "../contracts/types";

type DappContextType = {
  wallet?: Wallet<"injected">;
  web3?: Web3;
  connectWallet: () => void;
  addresses?: NetworkSpecificAddresses;
  abis?: NetworkSpecificAbis;
};

const DefaultDappContext: DappContextType = { connectWallet: THROWS };

const DappContext = createContext<DappContextType>(DefaultDappContext);

type DappProviderProps = {
  children: React.ReactNode;
};

export const DappProvider: React.FC<DappProviderProps> = ({ children }) => {
  const [web3, setWeb3] = useState<Web3>();
  const wallet = useWallet<"injected">();
  const [addresses, setAddresses] = useState<NetworkSpecificAddresses>();
  const [abis, setAbis] = useState<NetworkSpecificAbis>();

  const connectWeb3 = useCallback(() => {
    if (
      wallet.status !== "connected" ||
      !("web3" in window) ||
      // @ts-ignore
      !window.web3.currentProvider
    )
      return;
    // @ts-ignore
    setWeb3(new Web3(window.web3.currentProvider));
  }, [wallet.status]);

  const connectWallet = useCallback(() => {
    try {
      wallet.connect("injected");
    } catch (err) {
      console.error("could not connect the injected wallet");
      return;
    }
  }, [wallet]);

  const fetchNetworkContext = useCallback(async () => {
    if (wallet.status !== "connected") return;
    const resolvedNetwork = wallet?.networkName ? wallet.networkName : "goerli";
    console.debug(`fetching data for ${resolvedNetwork}`);
    const all = getAll(resolvedNetwork);
    if (!all) return;
    setAddresses(all.addresses);
    setAbis(all.abis);
  }, [wallet.status, wallet.networkName]);

  useEffect(() => {
    connectWeb3();
    fetchNetworkContext();
    // if the network or the account has changed -> re-connect the web3
  }, [wallet.networkName, wallet.account, connectWeb3, fetchNetworkContext]);

  return (
    <DappContext.Provider
      value={{ web3, wallet, connectWallet, addresses, abis }}
    >
      {children}
    </DappContext.Provider>
  );
};

export default DappContext;
