import { NftToken } from "../contexts/graph/types";
import { Nft } from "../contexts/graph/classes";
import { OpenSeaAsset } from "opensea-js/lib/types";
import { nftId } from "./firebase";
import fetch from "unfetch";

// https://ipfs.github.io/public-gateway-checker/gateways.json
const IPFSGateway = "https://ipfs.io/ipfs/";

/**
 * Matches IPFS CIDv0 (all start with Qm)
 * Matches IPFS CIDv1 (all start with b and use base32 case-insensitive encoding)
 * @param url
 * @returns
 */
const matchIPFS_URL = (url: string) => {
  const isIPFS_URL =
    url.match(/(Qm[1-9A-HJ-NP-Za-km-z]{44})(\/.+)?$/) ||
    url.match(/(b[1-7a-zA-Z]{58})(\/.+)?$/);
  return isIPFS_URL;
};

const matchWeirdBaseURL = (url: string) => {
  const isWeird = url.endsWith("0x{id}");
  return isWeird;
};

const removeWeirdBaseURLEnd = (url: string) => {
  const withoutEnd = url.slice(0, url.length - "0x{id}".length);
  return withoutEnd;
};

/**
 * ! There are issues with CORS policy. So Sandbox and a couple of others need to be
 * ! requested through a proxy
 * @param url check if it is sandbox. Sandbox does not set CORS headers, and so you need
 * to proxy the request, unfortunately.
 * @returns
 */
const isSandbox = (url: string) =>
  url.startsWith("https://api.sandbox.game/lands");

const isFirebase = (url: string) =>
  url.startsWith("https://us-central1-renft-nfts-meta");

const isBCCG = (url: string) =>
  url.startsWith("https://api.bccg.digital/api/bccg/");

const isJoyWorld = (url: string) =>
  url.startsWith("https://joyworld.azurewebsites.net");

const isNftBoxes = (url: string) =>
  url.startsWith("https://nftboxesboxes.azurewebsites.net");

const isGftAuthentic = (url: string) =>
  url.startsWith("https://gft-authentic-api.herokuapp.com");

const buildStaticIPFS_URL = (matched: string[]) => {
  const [, cid, path = ""] = matched;
  return `${IPFSGateway}${cid}${path}`;
};

export type NftMetaWithId = NftToken["meta"] & { id: string };
export type NftError = { id: string; error: string };

/**
 *
 * @param IPFS_URL is an output from matchIPFS_URL function.
 * @returns
 */
const loadMetaFromIPFS = async (
  IPFS_URL: RegExpMatchArray | null,
  id: string
): Promise<NftMetaWithId | NftError> => {
  if (!IPFS_URL) {
    console.warn("could not fetch meta IPFS URL");
    return { id, error: "cannot fetch meta from ipfs url" };
  }

  const staticIPFS_URL = buildStaticIPFS_URL(IPFS_URL);
  try {
    console.log('static ipfs url', staticIPFS_URL)
    const response = await fetch(staticIPFS_URL);

    let data: any = {};
    try {
      data = await response.json();
    } catch (e) {
      // ! this happens with ZORA media for me
      console.warn(`could not get json for ${staticIPFS_URL}, which could mean this is media`);
      return { image: staticIPFS_URL, id };
    }

    const imageIsIPFS_URL = matchIPFS_URL(data?.image);
    return {
      image: imageIsIPFS_URL
        ? buildStaticIPFS_URL(imageIsIPFS_URL)
        : data?.image,
      description: data?.description,
      name: data?.name,
      id,
    };
  } catch (err) {
    console.warn("issue loading meta from IPFS");
    return { id, error: "cannot load meta from ipfs" };
  }
};

export const fetchNFTFromOtherSource = async (
  nft: Nft
): Promise<NftMetaWithId | NftError> => {
  const { _mediaURI, _tokenURI } = nft;

  let tokenURI: string = _tokenURI;
  const key = nftId(nft.address, nft.tokenId);
  const isWeirdBaseURL = matchWeirdBaseURL(tokenURI);
  if (isWeirdBaseURL) {
    // ! this is opensea, in my tests. And even though this weird base url says you need hex
    // ! form int, you should in fact, pass an int number lol...
    tokenURI = removeWeirdBaseURLEnd(tokenURI) + nft.tokenId;
  }

  if (_mediaURI) {
    return { image: _mediaURI, id: key };
  }
  if (!tokenURI) return { id: key, error: "No tokenUri" };

  const isIPFS_URL = matchIPFS_URL(tokenURI);
  if (isIPFS_URL) return await loadMetaFromIPFS(isIPFS_URL, key);

  try {
    // ! people will tell us: my X NFT is not showing. We will check, and it
    // ! will probably because we aren't proxying the request for meta here
    const isProxyable =
      isSandbox(tokenURI) ||
      isFirebase(tokenURI) ||
      isBCCG(tokenURI) ||
      isJoyWorld(tokenURI) ||
      isNftBoxes(tokenURI) ||
      isGftAuthentic(tokenURI);
    if (!process.env.REACT_APP_CORS_PROXY) {
      throw new Error("CORS_PROXY is not defined");
    }
    const fetchThis = isProxyable
      ? `${process.env.REACT_APP_CORS_PROXY}${tokenURI}`
      : tokenURI;
    // It's still possible that the tokenUri points to opensea...
    const headers: Record<string, string> = {};
    if (
      process.env.REACT_APP_OPENSEA_API &&
      fetchThis.indexOf("api.opensea") > -1
    ) {
      headers["X-API-KEY"] = process.env.REACT_APP_OPENSEA_API;
    }
    const response = await fetch(fetchThis, {
      headers,
    });
    const data = await response?.json();

    if (!data?.image?.startsWith("ipfs://ipfs/")) {
      return {
        image: data?.image,
        description: data?.description,
        name: data?.name,
        id: key,
      };
    } else {
      console.warn(
        "is not IPFS URL, but we are downloading meta as if it is O_O"
      );
      return { id: key, error: "non-ipfs url" };
    }
  } catch (err) {
    console.warn(err);
    return { id: key, error: "unknown error" };
  }
};

const arrayToURI = (name: string, array: Array<string>) => {
  return `${array.map((item: string) => `${name}=${item}`).join("&")}`;
};

const isObject = (obj: unknown) => {
  return Object.prototype.toString.call(obj) === "[object Object]";
};

const snakeCaseToCamelCase = (obj: Record<string, unknown>) => {
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

export const fetchNFTsFromOpenSea = async (
  asset_contract_addresses: Array<string>,
  token_ids: Array<string>
): Promise<Array<NftMetaWithId>> => {
  if (!process.env.REACT_APP_OPENSEA_API) {
    throw new Error("OPENSEA_API is not defined");
  }
  return await fetch(
    `https://api.opensea.io/api/v1/assets/?${arrayToURI(
      "asset_contract_addresses",
      asset_contract_addresses
    )}&${arrayToURI("token_ids", token_ids)}&limit=50`,
    {
      headers: {
        "X-API-KEY": process.env.REACT_APP_OPENSEA_API,
      },
    }
  )
    .then((r) => r.json())
    .then((r) => {
      return r.assets.map(snakeCaseToCamelCase).map((nft: OpenSeaAsset) => {
        return {
          ...nft,
          image:
            nft.imagePreviewUrl ||
            nft.imageUrlThumbnail ||
            nft.imageUrl ||
            nft.imageUrlOriginal,
          id: nftId(nft.assetContract.address, nft.tokenId || ""),
        };
      });
    });
};
