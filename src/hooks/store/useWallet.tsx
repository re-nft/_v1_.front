import { useMemo } from "react";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";

import { useActiveWeb3React } from "../../wallet-shell/state-hooks";

export const useWallet = (): {
  signer: JsonRpcSigner | null;
  address: string;
  web3Provider: Web3Provider | undefined;
  network: string;
} => {
  const { account, chainId, library } = useActiveWeb3React();

  const signer = useMemo(() => {
    if (!account) return null;
    if (!library) return null;

    return library.getSigner(account).connectUnchecked();
  }, [library, account]);

  const network = useMemo(() => {
    switch (chainId) {
      case 1: {
        return "homestead";
      }
      case 3: {
        return "ropsten";
      }
      case 4: {
        return "rinkedby";
      }
      case 5: {
        return "goerli";
      }
      case 42: {
        return "kovan";
      }
      //@ts-ignore
      case 1337: {
        return "localhost";
      }
      //@ts-ignore
      case 31337: {
        return "localhost";
      }
      default: {
        return "unsupported chain";
      }
    }
  }, [chainId]);

  return {
    signer,
    address: account || "",
    web3Provider: library,
    network,
  };
};
