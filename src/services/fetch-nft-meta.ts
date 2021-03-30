import { NftToken} from "../contexts/graph/types";
import { Nft } from "../contexts/graph/classes";

const isIpfsUrl = (url: string) => {
    return /^(\/ipfs|ipfs:\/)\/Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(url) || url.startsWith('ipfs://ipfs/');
}

const matchIPFS = (url: string) => url.match(/(Qm[1-9A-HJ-NP-Za-km-z]{44})(\/.+)?$/);

const buildStaticIpfsUrl = (url: string) => {
    const ipfsMatch = matchIPFS(url);
    if (ipfsMatch) {
        const [, cid, path = ""] = ipfsMatch;
        return `https://ipfs.io/ipfs/${cid}${path}`
    }
};

const loadMetaFromIpfs = async (url: string): Promise<NftToken['meta']> => {
    const ipfsMatch = matchIPFS(url);
    if (ipfsMatch) {
        const [, cid, path = ""] = ipfsMatch;
        const url = `https://ipfs.io/ipfs/${cid}${path}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            return {
                image: isIpfsUrl(data?.image) ? buildStaticIpfsUrl(data?.image) : data?.image,
                description: data?.description,
                name: data?.name
            };
        } catch(err) {
            console.warn(err)
        } 
    } else {
        return {};
    }
};

export const fetchNftMeta = async (nft: Nft): Promise<NftToken['meta']> => {
    const {tokenId, _mediaURI, _tokenURI} = nft;
    if (_mediaURI) return { image: _mediaURI };

    if (_tokenURI) {
        if (isIpfsUrl(_tokenURI)) {
            return await loadMetaFromIpfs(_tokenURI);
        } else {    
            try {
                const response = await fetch(_tokenURI);
                const data = await response?.json();
                if (!data?.image?.startsWith('ipfs://ipfs/')) {
                    return {
                        image: data?.image,
                        description: data?.description,
                        name: data?.name
                    };
                } else {
                    return await loadMetaFromIpfs(_tokenURI);
                }
            } catch(err) {
                console.warn(err)
            }
        }

        return {};
    }

    if (!_tokenURI && !_mediaURI) {
        console.log(' tokenId ', tokenId);
        try {
            const tokenURIfromContract = await nft.loadTokenURI();
            console.log(tokenURIfromContract);
            if (tokenURIfromContract) {
                const raw = await fetch(tokenURIfromContract);
                return {};
            } else {
                return {};
            }
        } catch(err) {
            console.warn(err)
        }
    }

    return {};
};

