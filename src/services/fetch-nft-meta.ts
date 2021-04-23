import { NftToken } from "../contexts/graph/types";
import { Nft } from "../contexts/graph/classes";
import { CORS_PROXY } from "../consts";

const IPFSGateway = "http://dweb.link/ipfs/";

const isIpfsUrl = (url: string) => {
  return (
    /^(\/ipfs|ipfs:\/)\/Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(url) ||
    url.startsWith("ipfs://ipfs/")
  );
};

// TODO: will not match the new format that starts with a char 'b'
const matchIPFS = (url: string) =>
  url.match(/(Qm[1-9A-HJ-NP-Za-km-z]{44})(\/.+)?$/);

// there are issues with CORS policy. So Sandbox and a couple of others need to be
// requested through a proxy
const matchSandbox = (url: string) =>
  url.match(/^(https:\/\/api.sandbox.game\/lands)/);

const buildStaticIPFS_URL = (url: string) => {
  const ipfsMatch = matchIPFS(url);
  if (ipfsMatch) {
    const [, cid, path = ""] = ipfsMatch;
    return `${IPFSGateway}${cid}${path}`;
  }
};

const loadMetaFromIPFS = async (url: string): Promise<NftToken["meta"]> => {
  const ipfsMatch = matchIPFS(url);
  // * the if is required to satisfy the typescript. Otherwise, it may think it is null
  if (!ipfsMatch) return {};
  const [, cid, path = ""] = ipfsMatch;
  try {
    const response = await fetch(`${IPFSGateway}${cid}${path}`);
    const data = await response.json();
    return {
      image: isIpfsUrl(data?.image)
        ? buildStaticIPFS_URL(data?.image)
        : data?.image,
      description: data?.description,
      name: data?.name,
    };
  } catch (err) {
    console.warn("issue loading meta from IPFS");
  }
};

export const fetchNFTMeta = async (nft: Nft): Promise<NftToken["meta"]> => {
  const { _mediaURI, _tokenURI } = nft;
  if (_mediaURI) return { image: _mediaURI };

  if (_tokenURI) {
    if (isIpfsUrl(_tokenURI)) {
      return await loadMetaFromIPFS(_tokenURI);
    } else {
      try {
        // ! name this flag "proxyable".
        // ! if isProxyable, then use firebase cors proxy.
        // ! so far (my wallet), it appears that only Sandbox requires proxying.
        // ! people will tell us: my X NFT is not showing. We will check, and it
        // ! will probably because we aren't proxying the request for meta here
        const isSandbox = matchSandbox(_tokenURI);
        const fetchThis = isSandbox ? `${CORS_PROXY}${_tokenURI}` : _tokenURI;
        const response = await fetch(fetchThis);
        console.log("response", response);
        const data = await response?.json();
        if (!data?.image?.startsWith("ipfs://ipfs/")) {
          return {
            image: data?.image,
            description: data?.description,
            name: data?.name,
          };
        } else {
          return await loadMetaFromIPFS(_tokenURI);
        }
      } catch (err) {
        console.warn(err);
      }
    }

    return {};
  }

  return {};
};
