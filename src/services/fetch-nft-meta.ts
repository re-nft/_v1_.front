import { NftToken } from "../contexts/graph/types";
import { Nft } from "../contexts/graph/classes";

import { AvoidsCORSHeaders } from "../consts";

const IPFSGateway = "http://dweb.link/ipfs/";

const isIpfsUrl = (url: string) => {
  return (
    /^(\/ipfs|ipfs:\/)\/Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(url) ||
    url.startsWith("ipfs://ipfs/")
  );
};

// TODO: will not match the newer format
const matchIPFS = (url: string) =>
  url.match(/(Qm[1-9A-HJ-NP-Za-km-z]{44})(\/.+)?$/);

const buildStaticIpfsUrl = (url: string) => {
  const ipfsMatch = matchIPFS(url);
  if (ipfsMatch) {
    const [, cid, path = ""] = ipfsMatch;
    return `${IPFSGateway}${cid}${path}`;
  }
};

const loadMetaFromIpfs = async (url: string): Promise<NftToken["meta"]> => {
  const ipfsMatch = matchIPFS(url);
  if (ipfsMatch) {
    const [, cid, path = ""] = ipfsMatch;
    const url = `${IPFSGateway}${cid}${path}`;
    try {
      const response = await fetch(url, {
        headers: AvoidsCORSHeaders,
        mode: "cors",
        method: "GET",
      });
      if (response) {
        //@ts-ignore
        console.log("plain text reponse", await response?.json());
      }
      const data = await response.json();
      return {
        image: isIpfsUrl(data?.image)
          ? buildStaticIpfsUrl(data?.image)
          : data?.image,
        description: data?.description,
        name: data?.name,
      };
    } catch (err) {
      console.warn(err);
    }
  } else {
    return {};
  }
};

export const fetchNftMeta = async (nft: Nft): Promise<NftToken["meta"]> => {
  const { _mediaURI, _tokenURI } = nft;
  if (_mediaURI) return { image: _mediaURI };

  console.log("fetching meta for, _mediaURI", _mediaURI);
  console.log("fetching meta for _tokenURI", _tokenURI);

  if (_tokenURI) {
    if (isIpfsUrl(_tokenURI)) {
      return await loadMetaFromIpfs(_tokenURI);
    } else {
      try {
        const response = await fetch(_tokenURI, {
          headers: AvoidsCORSHeaders,
          method: "GET",
          mode: "cors",
        });
        console.log("response", response);
        const data = await response?.json();
        if (!data?.image?.startsWith("ipfs://ipfs/")) {
          return {
            image: data?.image,
            description: data?.description,
            name: data?.name,
          };
        } else {
          return await loadMetaFromIpfs(_tokenURI);
        }
      } catch (err) {
        console.warn(err);
      }
    }

    return {};
  }

  return {};
};
