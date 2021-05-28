import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { ethers, Signer } from "ethers";
import Web3Modal, { getInjectedProvider } from "web3modal";
import { THROWS } from "../utils";

const DefaultUser = {
  address: "",
  signer: undefined,
  provider: undefined,
  connect: THROWS,
  web3Provider: undefined
};

type UserContextType = {
  address: string;
  connect: () => Promise<ethers.providers.Web3Provider | undefined> | void;
  provider: unknown;
  signer: Signer | undefined;
  web3Provider: ethers.providers.Web3Provider | undefined
};

const UserContext = createContext<UserContextType>(DefaultUser);

export const UserProvider: React.FC = ({ children }) => {
  // const [currentAddress, setAddress] = useState(DefaultUser.currentAddress);
  const [provider, setProvider] = useState<unknown>();
  const [web3Provider, setWeb3Provider] =
    useState<ethers.providers.Web3Provider>();
  const [signer, setSigner] = useState<Signer>();
  const [address, setAddress] = useState<string>("");

  const providerOptions = useMemo(() => ({}), []);
  // web3modal is only working in browser\]
  const web3Modal = useMemo(() => {
    return typeof window !== "undefined"
      ? new Web3Modal({
          cacheProvider: false,
          providerOptions, // required
        })
      : null;
  }, [providerOptions]);

  // TODO connect only works if metamask is installed, otherwise it just creates a grayed empty popup
  const connect = useCallback(async () => {
    if (web3Modal) {
      const provider = await web3Modal.connect();
      const web3p = new ethers.providers.Web3Provider(provider);
      const _signer = web3p.getSigner();
      setSigner(_signer);
      const address = await _signer.getAddress().then((t) => t.toLowerCase());
      setAddress(address || "");
      setProvider(provider);
      setWeb3Provider(web3p);
      return Promise.resolve(web3p);
    }
  }, [web3Modal]);

  // reconnect if connected once
  // this is necessary, because metamask window shows connected state in it's wallet
  // this will not connect if never connected or clicked on disconnect, try it in private window
  useEffect(() => {
    const injectedProvider = getInjectedProvider();
    if (web3Modal) {
      if (injectedProvider && !provider) {
        connect();
      }
    }
  }, [connect, provider, web3Modal]);

  // change account
  useEffect(() => {
    if (provider) {
      // web3modal is untyped...
      // https://github.com/Web3Modal/web3modal/blob/2ff929d0e99df5edf6bb9e88cff338ba6d8a3991/src/core/index.tsx#L71
      // @ts-ignore
      provider.on("accountsChanged", connect);
    }
    return () => {
      if (provider) {
        // web3modal is untyped...
        // https://github.com/Web3Modal/web3modal/blob/2ff929d0e99df5edf6bb9e88cff338ba6d8a3991/src/core/index.tsx#L71
        // @ts-ignore
        provider.off("accountsChanged", connect);
      }
    };
  }, [connect, provider]);

  return (
    <UserContext.Provider value={{ connect, provider, signer, address, web3Provider }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
