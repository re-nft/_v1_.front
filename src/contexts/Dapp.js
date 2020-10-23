import { createContext } from "react";

const DefaultDappContext = {
  wallet: null
};

const DappContext = createContext(DefaultDappContext);

export default DappContext;
