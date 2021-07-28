import { Nft } from "../contexts/graph/classes";
import { getContractWithProvider } from "../utils";

// https://ipfs.github.io/public-gateway-checker/gateways.json
export const IPFSGateway = "https://ipfs.io/ipfs/";

/**
 * Matches IPFS CIDv0 (all start with Qm)
 * Matches IPFS CIDv1 (all start with b and use base32 case-insensitive encoding)
 * @param url
 * @returns
 */
export const matchIPFS_URL = (url: string): RegExpMatchArray | null =>
  url.match(/(Qm[1-9A-HJ-NP-Za-km-z]{44})(\/.+)?$/) ||
  url.match(/(b[1-7a-zA-Z]{58})(\/.+)?$/);

export const matchWeirdBaseURL = (url: string): boolean =>
  url.endsWith("0x{id}");

export const removeWeirdBaseURLEnd = (url: string): string =>
  url.slice(0, url.length - "0x{id}".length);

/**
 * ! There are issues with CORS policy. So Sandbox and a couple of others need to be
 * ! requested through a proxy
 * @param url check if it is sandbox. Sandbox does not set CORS headers, and so you need
 * to proxy the request, unfortunately.
 * @returns
 */
export const isSandbox = (url: string): boolean =>
  url.startsWith("https://api.sandbox.game/lands");

export const isFirebase = (url: string): boolean =>
  url.startsWith("https://us-central1-renft-nfts-meta");

export const isBCCG = (url: string): boolean =>
  url.startsWith("https://api.bccg.digital/api/bccg/");

export const isJoyWorld = (url: string): boolean =>
  url.startsWith("https://joyworld.azurewebsites.net");

export const isNftBoxes = (url: string): boolean =>
  url.startsWith("https://nftboxesboxes.azurewebsites.net");

export const isGftAuthentic = (url: string): boolean =>
  url.startsWith("https://gft-authentic-api.herokuapp.com");

export const buildStaticIPFS_URL = (matched: string[]): string => {
  const [, cid, path = ""] = matched;
  return `${IPFSGateway}${cid}${path}`;
};


export const normalizeTokenUri = async (nft: Nft): Promise<string> => {
  let tokenURI: string = nft.tokenURI;
  const isWeirdBaseURL = matchWeirdBaseURL(tokenURI);
  if (isWeirdBaseURL) {
    // ! this is opensea, in my tests. And even though this weird base url says you need hex
    // ! form int, you should in fact, pass an int number lol...
    tokenURI = removeWeirdBaseURLEnd(tokenURI) + nft.tokenId;
  }
  return tokenURI;
};

export const buildURI = (tokenURI: string): string => {
  const isIPFS_URL = matchIPFS_URL(tokenURI);
  if (isIPFS_URL) {
    return buildStaticIPFS_URL(isIPFS_URL);
  }
  // ! people will tell us: my X NFT is not showing. We will check, and it
  // ! will probably because we aren't proxying the request for meta here
  const isProxyable =
    isSandbox(tokenURI) ||
    isFirebase(tokenURI) ||
    isBCCG(tokenURI) ||
    isJoyWorld(tokenURI) ||
    isNftBoxes(tokenURI) ||
    isGftAuthentic(tokenURI);
  if (!process.env.NEXT_PUBLIC_CORS_PROXY) {
    throw new Error("CORS_PROXY is not defined");
  }
  const fetchThis = isProxyable
    ? `${process.env.NEXT_PUBLIC_CORS_PROXY}${tokenURI}`
    : tokenURI;
  return fetchThis;
};

export const isObject = (obj: unknown): boolean => {
  return Object.prototype.toString.call(obj) === "[object Object]";
};

export const snakeCaseToCamelCase = (
  obj: Record<string, unknown>
): Record<string, unknown> => {
  const initialVal: Record<string, unknown> = {};
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const newKey = key.replace(/(_\w)/g, function (k) {
      return k[1].toUpperCase();
    });
    if (isObject(value)) {
      acc[newKey] = snakeCaseToCamelCase(value as Record<string, unknown>);
    } else {
      acc[newKey] = value;
    }
    return acc;
  }, initialVal);
};

export const arrayToURI = (name: string, array: Array<string>): string =>
  `${array.map((item: string) => `${name}=${item}`).join("&")}`;
