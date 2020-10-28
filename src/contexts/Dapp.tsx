import React, { createContext, useEffect, useState, useCallback } from "react";
import { useWallet, Wallet } from "use-wallet";
import Web3 from "web3";

type DappContextType = {
  wallet?: Wallet<"injected">;
  web3?: Web3;
};

const DefaultDappContext: DappContextType = {
  wallet: null,
  web3: null
};

const DappContext = createContext<DappContextType>(DefaultDappContext);

export const DappProvider = ({ children }) => {
  // state & provider related
  const [web3, setWeb3] = useState<Web3>();
  const wallet = useWallet<"injected">();

  // callbacks
  const connectWallet = useCallback(() => {
    if (wallet != null && wallet.account) {
      console.debug("already connected");
      return;
    }
    wallet.connect("injected");

    if (web3 == null) {
      if ("web3" in window) {
        //@ts-ignore
        if (!window.web3.currentProvider) {
          return;
        }
        //@ts-ignore
        setWeb3(new Web3(window.web3.currentProvider));
      }
    }
    // ! could not add window here. compile time error that window is not defined
    //@ts-ignore
  }, [wallet]);

  // ---------------
  useEffect(() => {
    connectWallet();
  }, [connectWallet]);

  return (
    <DappContext.Provider value={{ web3, wallet }}>
      {children}
    </DappContext.Provider>
  );
};

export default DappContext;
