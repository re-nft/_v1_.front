import { useEffect, useMemo, useCallback } from "react";
import { ethers, Signer } from "ethers";
import Web3Modal from "web3modal";
import { hasDifference, THROWS } from "../../utils";
import { EMPTY, from, timer, map, switchMap } from "rxjs";
import { SECOND_IN_MILLISECONDS } from "../../consts";
import ReactGA from "react-ga";

import produce from "immer";
import create from "zustand";
import shallow from "zustand/shallow";

type WalletContextType = {
  address: string;
  permissions: unknown[];
  connect: () => Promise<ethers.providers.Web3Provider | undefined> | void;
  signer: Signer | undefined;
  web3Provider: ethers.providers.Web3Provider | undefined;
  network: string;
  provider: any;
  setProvider: (p: any) => void;
  setNetworkName: (str: string) => void;
  setWeb3Provider: (p: ethers.providers.Web3Provider | undefined) => void;
  setAddress: (address: string) => void;
  setSigner: (s: Signer | undefined) => void;
  setPermissions: (str: unknown[]) => void;
};

const useWalletState = create<WalletContextType>((set) => ({
  address: "",
  signer: undefined,
  provider: undefined,
  connect: THROWS,
  web3Provider: undefined,
  network: "",
  permissions: [],
  setProvider: (provider: any) =>
    set(
      produce((state) => {
        state.provider = provider;
      })
    ),
  setNetworkName: (n: string) =>
    set(
      produce((state) => {
        state.network = n;
      })
    ),
  setAddress: (n: string) =>
    set(
      produce((state) => {
        state.address = n;
      })
    ),
  setSigner: (n: Signer | undefined) =>
    set(
      produce((state) => {
        state.signer = n;
      })
    ),
  setPermissions: (n: unknown) =>
    set(
      produce((state) => {
        state.permissions = n;
      })
    ),
  setWeb3Provider: (p: ethers.providers.Web3Provider | undefined) =>
    set(
      produce((state) => {
        state.web3Provider = p;
      })
    ),
}));

export const useWallet = () => {
  // const [currentAddress, setAddress] = useState(DefaultUser.currentAddress);
  const provider = useWalletState(
    useCallback((state) => state.provider, []),
    shallow
  );
  const network = useWalletState(
    useCallback((state) => state.network, []),
    shallow
  );
  const web3Provider = useWalletState(
    useCallback((state) => state.web3Provider, []),
    shallow
  );
  const address = useWalletState(
    useCallback((state) => state.address, []),
    shallow
  );
  const permissions = useWalletState(
    useCallback((state) => state.permissions, []),
    shallow
  );
  const signer = useWalletState(
    useCallback((state) => state.signer, []),
    shallow
  );
  const setProvider = useWalletState((state) => state.setProvider);
  const setWeb3Provider = useWalletState((state) => state.setWeb3Provider);
  const setNetworkName = useWalletState((state) => state.setNetworkName);
  const setSigner = useWalletState((state) => state.setSigner);
  const setAddress = useWalletState((state) => state.setAddress);
  const setPermissions = useWalletState((state) => state.setPermissions);

  const providerOptions = useMemo(() => ({}), []);
  const hasWindow = useMemo(() => {
    return typeof window !== "undefined";
  }, []);
  // web3modal is only working in browser\]
  const web3Modal = useMemo(() => {
    return hasWindow
      ? new Web3Modal({
          cacheProvider: false,
          providerOptions, // required
        })
      : null;
  }, [providerOptions, hasWindow]);

  const initState = useCallback(
    async (provider: any) => {
      const web3p = new ethers.providers.Web3Provider(provider);
      const network = await web3p?.getNetwork();
      const name = network.chainId === 31337 ? "localhost" : network?.name;
      const nname = name === "homestead" ? "mainnet" : name;
      const signer = web3p.getSigner();
      const address = await signer
        .getAddress()
        .then((t) => t.toLowerCase())
        .catch((e) => {
          // do nothing
          console.log(e);
        });
      setNetworkName(nname);
      setSigner(signer);
      setAddress(address || "");
      setProvider(provider);
      setWeb3Provider(web3p);
    },
    [setNetworkName, setSigner, setAddress, setProvider, setWeb3Provider]
  );

  const connect = useCallback(
    (manual: boolean) => {
      if (!web3Modal) return EMPTY;
      if (!(!!manual || (permissions.length > 0 && !signer))) return EMPTY;
      // only reconnect if we have permissions or
      // user manually connected through action
      return from(
        new Promise((resolve) =>
          web3Modal
            .connect()
            .then((provider) => {
              resolve(provider);
              return initState(provider);
            })
            .catch(() => {
              resolve(null);
            })
        )
      );
    },
    [web3Modal, permissions, signer, initState]
  );

  // there is no better way to do disconnect with metemask+web3modal combo
  const connectDisconnect = useCallback(() => {
    if (!hasWindow || !window.ethereum) return EMPTY;
    return from<Promise<string[]>>(
      new Promise((resolve) => {
        window.ethereum
          .request({ method: "wallet_getPermissions" })
          .then((w: any) => {
            //TODO they keep changing wallet_getPermissions
            resolve(w[0]?.caveats[1]?.value || {});
          })
          .catch((error: unknown) => {
            console.warn("wallet_getPermissions", error);
            resolve([]);
          });
      })
    ).pipe(
      map((newPermissions: string[]) => {
        if (hasDifference(newPermissions, permissions)) {
          setPermissions(newPermissions);
          if (newPermissions.length < 1) {
            if (signer) setSigner(undefined);
            if (address) setAddress("");
            if (network) setNetworkName("");
          }
        }
        return;
      })
    );
  }, [
    address,
    network,
    signer,
    hasWindow,
    permissions,
    setPermissions,
    setAddress,
    setSigner,
    setNetworkName,
  ]);

  useEffect(() => {
    const subscription = timer(0, 10 * SECOND_IN_MILLISECONDS)
      .pipe(switchMap(() => connect(false)))
      .subscribe();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [connect]);

  useEffect(() => {
    const subscription = timer(0, 10 * SECOND_IN_MILLISECONDS)
      .pipe(switchMap(connectDisconnect))
      .subscribe();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [connectDisconnect]);

  const manuallyConnect = useCallback(() => {
    connect(true);
  }, [connect]);

  useEffect(() => {
    ReactGA.set({ userId: address });
  }, [address]);

  const accountsChanged = useCallback(
    (arg) => {
      if (arg.length > 0) {
        const check = connect(true).subscribe(() => {
          check.unsubscribe();
        });
      }
      if (arg.length === 0) {
        // disconnect case
        if (permissions.length > 0) setPermissions([]);
        if (signer) setSigner(undefined);
        if (address) setAddress("");
        if (network) setNetworkName("");
      }
    },
    [
      address,
      connect,
      network,
      permissions.length,
      signer,
      setPermissions,
      setAddress,
      setSigner,
      setNetworkName,
    ]
  );
  const chainChanged = useCallback(
    (arg) => {
      const check = connect(true).subscribe(() => {
        check.unsubscribe();
      });
    },
    [connect]
  );

  // change account
  useEffect(() => {
    if (provider && provider.on) {
      provider.on("accountsChanged", accountsChanged);
      provider.on("chainChanged", chainChanged);
    } else if (provider && provider.addListener) {
      provider.addListener("accountsChanged", accountsChanged);
      provider.addListener("chainChanged", chainChanged);
    }
    return () => {
      // this is strange, there is On method, but there is no off method
      // add both cases for sanity
      if (provider && provider.off) {
        provider.off("accountsChanged", accountsChanged);
        provider.off("chainChanged", chainChanged);
      } else if (provider && provider.removeListener) {
        provider.removeListener("accountsChanged", accountsChanged);
        provider.removeListener("chainChanged", chainChanged);
      }
    };
  }, [accountsChanged, chainChanged, provider]);

  return {
    connect: manuallyConnect,
    signer,
    address,
    web3Provider,
    network,
  };
};
