import Ipfs from "ipfs-core";
import { useEffect, useState } from "react";

// to only be set once, even if each invocation useIpfsFactory() creates
// a new instance of useIpfsFactory component hook
let ipfs: Ipfs.IPFS | undefined = undefined;

type UseIpfsFactoryReturn = {
  ipfs?: Ipfs.IPFS;
  isIpfsReady: boolean;
  ipfsInitError: string;
};

export const useIpfsFactory = (): UseIpfsFactoryReturn => {
  const [isIpfsReady, setIpfsReady] = useState(false);
  const [ipfsInitError, setIpfsInitError] = useState<string>("");

  useEffect(() => {
    // The fn to useEffect should not return anything other than a cleanup fn,
    // So it cannot be marked async, which causes it to return a promise,
    // Hence we delegate to a async fn rather than making the param an async fn.
    const startIpfs = async () => {
      if (ipfs) {
        console.log("IPFS already started");
        return;
      }

      //@ts-ignore
      if (window.ipfs?.enable) {
        console.log("Found window.ipfs");
        //@ts-ignore
        ipfs = window.ipfs;
        return;
      }

      try {
        ipfs = await Ipfs.create();
        console.timeEnd("IPFS Started");
      } catch (error) {
        setIpfsInitError(error);
      }

      setIpfsReady(Boolean(ipfs));
    };

    startIpfs();

    return function cleanup() {
      if (ipfs?.stop) {
        console.log("Stopping IPFS");
        ipfs.stop().catch((err) => console.error(err));
        ipfs = undefined;
        setIpfsReady(false);
      }
    };
  }, []);

  return { ipfs, isIpfsReady, ipfsInitError };
};

export default useIpfsFactory;
