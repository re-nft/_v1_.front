import { NftToken } from "../contexts/graph/types";
import { Nft } from "../contexts/graph/classes";

const IPFSGateway = "https://dweb.link/ipfs/";

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

/**
 *
 * @param IPFS_URL is an output from matchIPFS_URL function.
 * @returns
 */
const loadMetaFromIPFS = async (
  IPFS_URL: RegExpMatchArray | null
): Promise<NftToken["meta"]> => {
  if (!IPFS_URL) {
    console.warn("could not fetch meta IPFS URL");
    return {
      image: "",
      description: "",
      name: "",
    };
  }

  const staticIPFS_URL = buildStaticIPFS_URL(IPFS_URL);
  try {
    const response = await fetch(staticIPFS_URL);

    let data: any = {};
    try {
      data = await response.json();
    } catch {
      // ! this happens with ZORA media for me
      console.warn("could not get json, which could mean this is media");
      return { image: staticIPFS_URL };
    }

    const imageIsIPFS_URL = matchIPFS_URL(data?.image);
    return {
      image: imageIsIPFS_URL
        ? buildStaticIPFS_URL(imageIsIPFS_URL)
        : data?.image,
      description: data?.description,
      name: data?.name,
    };
  } catch (err) {
    console.warn("issue loading meta from IPFS");
  }
};

export const fetchNFTFromIPFS = async (nft: Nft): Promise<NftToken["meta"]> => {
  const { _mediaURI, _tokenURI } = nft;

  let tokenURI = await nft.loadTokenURI();
  if (!tokenURI) return {};

  const isWeirdBaseURL = matchWeirdBaseURL(tokenURI);
  if (isWeirdBaseURL) {
    // ! this is opensea, in my tests. And even though this weird base url says you need hex
    // ! form int, you should in fact, pass an int number lol...
    tokenURI = removeWeirdBaseURLEnd(tokenURI) + nft.tokenId;
  }

  if (_mediaURI) return { image: _mediaURI };

  const isIPFS_URL = matchIPFS_URL(tokenURI);
  if (isIPFS_URL) return await loadMetaFromIPFS(isIPFS_URL);

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
    const response = await fetch(fetchThis);
    const data = await response?.json();

    if (!data?.image?.startsWith("ipfs://ipfs/")) {
      return {
        image: data?.image,
        description: data?.description,
        name: data?.name,
      };
    } else {
      console.warn(
        "is not IPFS URL, but we are downloading meta as if it is O_O"
      );
      return {};
    }
  } catch (e) {
    console.warn(e);
    console.warn("error fetching nft meta");
    return {};
  }
};

export const fetchNFTFromOpenSea = async (
  nft: Nft
): Promise<NftToken["meta"]> => {
  if (!process.env.REACT_APP_OPENSEA_API) {
    throw new Error("OPENSEA_API is not defined");
  }
  return await fetch(
    `https://api.opensea.io/api/v1/asset/${nft.address}/${nft.tokenId}`,
    {
      headers: {
        "X-API-KEY": process.env.REACT_APP_OPENSEA_API,
      },
    }
  )
    .then((r) => r.json())
    .then((r) => {
      return {
        image: r.image_url || r.image_preview_url,
      };
    });
};

const arrayToURI = (name: string, array: Array<string>) => {
  return `${array.map((item: string) => `${name}=${item}`).join("&")}`;
};

export const fetchNFTsFromOpenSea = async (
  asset_contract_addresses: Array<string>,
  token_ids: Array<string>
): Promise<Array<NftToken["meta"] & {id: string}>> => {
  if (!process.env.REACT_APP_OPENSEA_API) {
    throw new Error("OPENSEA_API is not defined");
  }
  return await fetch(
    `https://api.opensea.io/api/v1/assets/?${arrayToURI(
      "asset_contract_addresses",
      asset_contract_addresses
    )}&${arrayToURI("token_ids", token_ids)}`,
    {
      headers: {
        "X-API-KEY": process.env.REACT_APP_OPENSEA_API,
      },
    }
  )
    .then((r) => r.json())
    .then((r) => {
      // TODO
      return r.assets.map((nft:any) =>{
        return {
          ...nft,
          image: nft.image_preview_url || nft.image_preview_url || nft.image_thumbnail_url || nft.image_original_url,
          id: `${nft.asset_contract.address}-${nft.token_id}`,
        }
      })
    });
};
export const fetchNFTMeta = async (nft: Nft): Promise<NftToken["meta"]> => {
  return fetchNFTFromOpenSea(nft);
  //return Promise.any([fetchNFTFromIPFS(nft), fetchNFTFromOpenSea(nft)])
};
