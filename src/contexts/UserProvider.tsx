import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { ethers, Signer } from "ethers";
import Web3Modal from "web3modal";
import { THROWS } from "../utils";
import usePoller from "../hooks/usePoller";
import createCancellablePromise from "./create-cancellable-promise";

const DefaultUser = {
  address: "",
  signer: undefined,
  provider: undefined,
  connect: THROWS,
  web3Provider: undefined,
  network: "",
};

type UserContextType = {
  address: string;
  connect: () => Promise<ethers.providers.Web3Provider | undefined> | void;
  provider: unknown;
  signer: Signer | undefined;
  web3Provider: ethers.providers.Web3Provider | undefined;
  network: string;
};

const UserContext = createContext<UserContextType>(DefaultUser);

export const UserProvider: React.FC = ({ children }) => {
  // const [currentAddress, setAddress] = useState(DefaultUser.currentAddress);
  const [provider, setProvider] = useState<unknown>();
  const [network, setNetworkName] = useState<string>("");
  const [web3Provider, setWeb3Provider] =
    useState<ethers.providers.Web3Provider>();
  const [signer, setSigner] = useState<Signer>();
  const [address, setAddress] = useState<string>("");
  const [permissions, setPermissions] = useState<unknown[]>([]);

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

  const initState = useCallback(async (provider) => {
    const web3p = new ethers.providers.Web3Provider(provider);
    const network = await web3p?.getNetwork();
    const name = network.chainId === 31337 ? "local" : network?.name;
    setNetworkName(name);
    const _signer = web3p.getSigner();
    setSigner(_signer);
    const address = await _signer
      .getAddress()
      .then((t) => t.toLowerCase())
      .catch(() => {
        // do nothing
      });
    setAddress(address || "");
    setProvider(provider);
    setWeb3Provider(web3p);
    return Promise.resolve(web3p);
  }, []);

  const connect = useCallback(
    async (manual: boolean) => {
      if (web3Modal) {
        // only reconnect if we have permissions or
        // user manually connected through action
        if (!!manual || (permissions.length > 0 && !signer)) {
          const provider = await web3Modal
            .connect()
            .then((p) => p)
            .catch(() => {
              // do nothing
            });
          if (!provider) return;
          await initState(provider);
        }
      }
    },
    [web3Modal, permissions, signer, initState]
  );

  // there is no better way to do disconnect with metemask+web3modal combo
  const connectDisconnect = useCallback(() => {
    const request = createCancellablePromise<unknown[]>(
      window.ethereum.request({ method: "wallet_getPermissions" })
    );

    request.promise
      .then((permissions: unknown[]) => {
        setPermissions(permissions);
        if (permissions.length < 1) {
          if (signer) setSigner(undefined);
          if (address) setAddress("");
          if (network) setNetworkName("");
        }
      })
      .catch((error: unknown) => {
        console.warn(error);
      });
    return request.cancel;
  }, [address, network, signer]);

  usePoller(connectDisconnect, 2000);
  usePoller(() => {
    connect(false);
  }, 2000);

  const manuallyConnect = useCallback(() => {
    connect(true);
  }, [connect]);

  const accountsChanged = useCallback(
    (arg) => {
      if (arg.lengths > 0) connect(false);
      if (arg.lengts === 0) {
        // disconnect case
        if (permissions.length > 0) setPermissions([]);
        if (signer) setSigner(undefined);
        if (address) setAddress("");
        if (network) setNetworkName("");
      }
    },
    [address, connect, network, permissions.length, signer]
  );
  const chainChanged = useCallback(
    (arg) => {
      connect(false);
    },
    [connect]
  );

  // change account
  useEffect(() => {
    if (provider) {
      // @ts-ignore
      // web3modal is untyped...
      // https://github.com/Web3Modal/web3modal/blob/2ff929d0e99df5edf6bb9e88cff338ba6d8a3991/src/core/index.tsx#L71
      // @ts-ignore
      provider.on("accountsChanged", accountsChanged);
      // @ts-ignore
      provider.on("chainChanged", chainChanged);
    }
    return () => {
      // @ts-ignore
      if (provider && typeof provider.off !== "undefined") {
        // web3modal is untyped...
        // https://github.com/Web3Modal/web3modal/blob/2ff929d0e99df5edf6bb9e88cff338ba6d8a3991/src/core/index.tsx#L71
        // @ts-ignore
        provider.off("accountsChanged", accountsChanged);
        // @ts-ignore
        provider.off("chainChanged", chainChanged);
      }
    };
  }, [accountsChanged, chainChanged, provider]);

  return (
    <UserContext.Provider
      value={{
        connect: manuallyConnect,
        provider,
        signer,
        address,
        web3Provider,
        network,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
