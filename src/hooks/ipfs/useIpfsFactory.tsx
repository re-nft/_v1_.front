import Ipfs from "ipfs-core";
import { useEffect, useState } from "react";

let ipfs: Ipfs.IPFS | undefined = undefined;

type useIpfsFactoryReturnT = {
  ipfs?: Ipfs.IPFS;
  isIpfsReady: boolean;
  ipfsInitError: string;
};

const useIpfsFactory = (): useIpfsFactoryReturnT => {
  const [isIpfsReady, setIpfsReady] = useState(false);
  const [ipfsInitError, setIpfsInitError] = useState<string>("");

  useEffect(() => {
    // The fn to useEffect should not return anything other than a cleanup fn,
    // So it cannot be marked async, which causes it to return a promise,
    // Hence we delegate to a async fn rather than making the param an async fn.
    async function startIpfs() {
      if (ipfs) {
        console.log("IPFS already started");
        return;
        //@ts-ignore
      } else if (window.ipfs?.enable) {
        console.log("Found window.ipfs");
        //@ts-ignore
        ipfs = window.ipfs;
      } else {
        try {
          ipfs = await Ipfs.create();
          // const lsFiles = _ipfs.files.ls(
          //   "/ipfs/QmRBh6trb2nEa9wFfMfYwcKyGyu8jSEtqRgkVH6UY6VnGa"
          // );
          // for (await blob of lsFiles) {
          //   console.log(blob);
          // }

          console.timeEnd("IPFS Started");
        } catch (error) {
          setIpfsInitError(error);
        }
      }

      setIpfsReady(Boolean(ipfs));
    }

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
