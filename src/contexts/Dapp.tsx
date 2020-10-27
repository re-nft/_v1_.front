import { createContext } from "react";

const DefaultDappContext = {
  wallet: null,
  web3: null,
  setWeb3: () => {}
};

const DappContext = createContext(DefaultDappContext);

export default DappContext;
