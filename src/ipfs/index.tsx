import { getRandomInt } from "../utils";
import { backOff } from "exponential-backoff";
import CID from "cids";

// const CORS_PROXY = process.env["REACT_APP_CORS_PROXY"];

// taken from https://ipfs.github.io/public-gateway-checker/
const GATEWAYS = [
  "ipfs.io",
  "gateway.ipfs.io",
  "ipfs.sloppyta.co",
  "gateway.pinata.cloud",
  "ninetailed.ninja",
  "10.via0.com",
  "jorropo.ovh",
  "gateway.ravenland.org",
  "ipfs.greyh.at",
  "robotizing.net",
];

type pullArgs = {
  cids: string[];
  isBytesFetch?: boolean;
};

// makes 3 separate batch requests with the same request content
// whoever comes back with the response faster is what we return
const _pull = async ({
  cids = [],
  isBytesFetch = false,
}: pullArgs): Promise<Response[]> => {
  if (!cids.length) {
    console.warn("requested to pull from ipfs, but nothing to pull");
  }
  // gen 3 distinct indices and pull from the respective gateways
  const gatewayIndices: number[] = [];
  let indicesToPullFrom = 3;
  while (indicesToPullFrom) {
    const rn = getRandomInt(GATEWAYS.length);
    if (gatewayIndices.includes(rn)) continue;
    gatewayIndices.push(rn);
    indicesToPullFrom--;
  }
  const reqs: Promise<Response>[][] = [];
  // now we want to make the gateways race for each requested link
  // that means calling promise.race on 3 gateways for all links at the same time
  // and gathering the raced ones into the promise.all
  // [[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3]]
  // 4 links and 3 gateways
  for (const cid of cids) {
    reqs.push(
      gatewayIndices.map((ix) =>
        fetch(`https://${GATEWAYS[ix]}/ipfs/${cid}`, {
          headers: [["Content-Type", "text/plain"]],
        })
          .then(async (dat) => {
            if (!isBytesFetch) {
              return await dat.json();
            } else {
              return dat;
            }
          })
          .catch(() => ({}))
      )
    );
  }
  const res = await Promise.all(reqs.map((req) => Promise.race(req)));
  return res;
};

export const pull = async ({
  cids = [],
  isBytesFetch = false,
}: pullArgs): Promise<Response[]> => {
  return await backOff(async () => await _pull({ cids, isBytesFetch }));
};

// todo: pretty inefficient
export const isIpfs = (link: string): boolean => {
  const containsIpfs = link.includes("ipfs");
  if (!containsIpfs) return false;
  const parts = link.split("/");
  const id = parts[parts.length - 1];
  return CID.isCID(id);
};
