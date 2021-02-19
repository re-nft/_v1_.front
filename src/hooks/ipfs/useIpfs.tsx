import Ipfs from "ipfs-core";
import { useState, useEffect } from "react";
import dotProp from "dot-prop";

/*
 * Pass the command you'd like to call on an ipfs instance.
 *
 * Uses setState to capture the response, so your component
 * will re-render when the result turns up.
 *
 */
/* eslint-disable-next-line */
export const useIpfs = (ipfs: Ipfs.IPFS, cmd: any, opts: any) => {
  const [res, setRes] = useState(null);
  useEffect(() => {
    callIpfs(ipfs, cmd, opts, setRes);
  }, [ipfs, cmd, opts]);
  return res;
};

/* eslint-disable-next-line */
async function callIpfs(ipfs: Ipfs.IPFS, cmd: any, opts: any, setRes: any) {
  if (!ipfs) return null;
  console.log(`Call ipfs.${cmd}`);
  const ipfsCmd = dotProp.get(ipfs, cmd);
  //@ts-ignore
  const res = await ipfsCmd(opts);
  console.log(`Result ipfs.${cmd}`, res);
  setRes(res);
}

export default useIpfs;
