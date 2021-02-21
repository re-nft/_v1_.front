import Ipfs from "ipfs-core";
import { useEffect, useState } from "react";

// const ipfs: Ipfs.IPFS | null = null;

type useIpfsFactoryReturnT = {
  ipfs?: Ipfs.IPFS;
  isIpfsReady: boolean;
  ipfsInitError: string;
};

/*
 * A quick demo using React hooks to create an ipfs instance.
 *
 * Hooks are brand new at the time of writing, and this pattern
 * is intended to show it is possible. I don't know if it is wise.
 *
 * Next steps would be to store the ipfs instance on the context
 * so use-ipfs calls can grab it from there rather than expecting
 * it to be passed in.
 */
const useIpfsFactory = (): useIpfsFactoryReturnT => {
  const [isIpfsReady, setIpfsReady] = useState(false);
  const [ipfsInitError, setIpfsInitError] = useState<string>("");
  const [ipfs, setIpfs] = useState<Ipfs.IPFS>();

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
        const _ipfs = await window.ipfs.enable({ commands: ["id"] });
        setIpfs(_ipfs);
      } else {
        try {
          console.time("IPFS Started");
          const _ipfs = await Ipfs.create();
          console.log("_ipfs", _ipfs);
          setIpfs(_ipfs);

          const lsFiles = _ipfs.files.ls(
            "/ipfs/QmRBh6trb2nEa9wFfMfYwcKyGyu8jSEtqRgkVH6UY6VnGa"
          );
          for (await blob of lsFiles) {
            console.log(blob);
          }

          console.timeEnd("IPFS Started");
        } catch (error) {
          console.error("IPFS init error:", error);
          setIpfs(undefined);
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
        setIpfs(undefined);
        setIpfsReady(false);
      }
    };
  }, []);

  return { ipfs, isIpfsReady, ipfsInitError };
};

export default useIpfsFactory;
