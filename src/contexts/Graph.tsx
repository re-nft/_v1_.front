import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { request } from "graphql-request";
import parse from "url-parse";
import { set as ramdaSet, lensPath, hasPath } from "ramda";
import { BytesLike, ethers, BigNumber } from "ethers";

import {
  CurrentAddressContext,
  MyERC721Context,
  RentNftContext,
  SignerContext,
} from "../hardhat/SymfoniContext";
import { ERC721 } from "../hardhat/typechain/ERC721";
import {
  getERC1155,
  getERC721,
  THROWS,
  unpackHexPrice,
  parsePaymentToken,
} from "../utils";
import { usePoller } from "../hooks/usePoller";
import {
  LendingRentingRaw,
  LendingRaw,
  Lending,
  Renting,
} from "../types/graph";
import { SECOND_IN_MILLISECONDS, DP18 } from "../consts";
import { pull } from "../ipfs";
import { URI } from "../types";
import { isConstructorDeclaration } from "typescript";

const CORS_PROXY = process.env["REACT_APP_CORS_PROXY"];

const IS_DEV_ENV =
  process.env["REACT_APP_ENVIRONMENT"]?.toLowerCase() === "development";

const ENDPOINT_RENFT_PROD =
  "https://api.thegraph.com/subgraphs/name/nazariyv/rentnft";
const ENDPOINT_RENFT_DEV =
  "http://localhost:8000/subgraphs/name/nazariyv/ReNFT";

// kudos to Luis: https://github.com/microchipgnu
// check out his latest on: https://twitter.com/microchipgnu
// and of course kudos to the Solidity God: wighawag
const ENDPOINT_EIP721_PROD =
  "https://api.thegraph.com/subgraphs/name/wighawag/eip721-subgraph";

const ENS_ADDRESS = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85".toLowerCase();
const ZORA_ADDRESS = "0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7";

type queryAllERC721T = {
  tokens: {
    id: string; // e.g. "0xbcd4f1ecff4318e7a0c791c7728f3830db506c71_3000013"
    tokenURI: string; // e.g. "https://nft.service.cometh.io/3000013"
  }[];
};

type Path = string[];

// '0x123...456': { tokenIds: { '1': ..., '2': ... } }
type AddressToErc721 = {
  [key: string]: {
    contract: ERC721;
    isApprovedForAll: boolean;
    // tokenId string to response
    tokenIds: {
      [key: string]: {
        meta?: Response;
      };
    };
  };
};

type AddressToLending = {
  [key: string]: {
    contract: ERC721;
    // * these are all approved, since I am lending them
    tokenIds: {
      [key: string]: Omit<Lending, "nftAddress" & "tokenId">;
    };
  };
};

type AddressToRenting = {
  [key: string]: {
    contract: ERC721;
    isApprovedForAll: boolean;
    tokenIds: {
      [key: string]: Renting;
    };
  };
};

type GraphContextType = {
  erc721s: AddressToErc721;
  lendings: AddressToLending;
  rentings: AddressToRenting;
  fetchAvailableNfts: () => void;
};

const DefaultGraphContext: GraphContextType = {
  erc721s: {},
  lendings: {},
  rentings: {},
  fetchAvailableNfts: THROWS,
};

const GraphContext = createContext<GraphContextType>(DefaultGraphContext);

const queryAllERC721 = (user: string): string => {
  return `{
    tokens(where: {owner: "${user.toLowerCase()}"}) {
      id
		  tokenURI
    }
  }`;
};

const queryLending = (): string => {
  return `{
    lendingRentings {
      lending {
        id
        nftAddress
        tokenId
        lenderAddress
        maxRentDuration
        dailyRentPrice
        nftPrice
        paymentToken
        collateralClaimed
      }
      renting {
        id
      }
    }
  }`;
};

const queryUser = (user: string): string => {
  return `{
    user(id: "${user.toLowerCase()}") {
      id
      lending {
        id
        nftAddress
        tokenId
        lenderAddress
        maxRentDuration
        dailyRentPrice
        nftPrice
        paymentToken
        renting {
          id
          renterAddress
          rentDuration
          rentedAt
        }
      }
      renting {
        id
        rentDuration
        rentedAt
        lending {
          id
          nftAddress
          tokenId
          lenderAddress
          maxRentDuration
          dailyRentPrice
          nftPrice
          paymentToken
          collateralClaimed
        }
      }
    }
  }`;
};

export const GraphProvider: React.FC = ({ children }) => {
  // ! currentAddress can be ""
  const [currentAddress] = useContext(CurrentAddressContext);
  const [signer] = useContext(SignerContext);
  const [erc721s, setErc721s] = useState<AddressToErc721>({});
  const [lendings, setLendings] = useState<AddressToLending>({});
  const [rentings, setRentings] = useState<AddressToRenting>({});

  const myERC721 = useContext(MyERC721Context);
  const renft = useContext(RentNftContext);

  const parseLending = useCallback((lending: LendingRaw): Lending => {
    return {
      id: lending.id,
      nftAddress: ethers.utils.getAddress(lending.nftAddress),
      tokenId: lending.tokenId,
      lenderAddress: ethers.utils.getAddress(lending.lenderAddress),
      maxRentDuration: Number(lending.maxRentDuration),
      dailyRentPrice: unpackHexPrice(lending.dailyRentPrice, DP18),
      nftPrice: unpackHexPrice(lending.nftPrice, DP18),
      paymentToken: parsePaymentToken(lending.paymentToken),
      renting: lending.renting ?? undefined,
      collateralClaimed: Boolean(lending.collateralClaimed),
    };
  }, []);

  // ! only used in dev environment
  const fetchNftMetaDev = useCallback(async () => {
    if (!myERC721.instance) return [];
    const toFetch: Promise<Response>[] = [];
    const tokenIds: string[] = [];
    const contract = myERC721.instance;
    // * won't fetch in prod
    // pull all of the tokens of the current address
    const numNfts = await contract
      .balanceOf(currentAddress)
      .catch(() => BigNumber.from("0"));
    for (let i = 0; i < numNfts.toNumber(); i++) {
      // get the tokenId, and then fetch the metadata uri, then push this to toFetch
      const tokenId = await contract
        .tokenOfOwnerByIndex(currentAddress, i)
        .catch(() => -1);
      if (tokenId === -1) continue;
      tokenIds.push(tokenId.toString());
      const metaURI = await contract.tokenURI(tokenId).catch(() => "");
      // todo: other NFTs might have this CORS issue
      // todo: load on the proxy server might be too high, that would be a good problem to solve
      const uriToPull = metaURI.startsWith("https://api.sandbox.game")
        ? `${CORS_PROXY}${metaURI}`
        : metaURI;
      if (uriToPull)
        toFetch.push(
          fetch(uriToPull)
            .then(async (dat) => await dat.json())
            .catch(() => ({}))
        );
    }
    const res = await Promise.all(toFetch);
    const tokenIdsObj = {};
    for (let i = 0; i < res.length; i++) {
      Object.assign(tokenIdsObj, { [tokenIds[i]]: res[i] });
    }
    const isApprovedForAll = await contract
      .isApprovedForAll(
        currentAddress,
        /* eslint-disable-next-line */
        renft.instance!.address
      )
      .catch(() => false);
    setErc721s({
      [contract.address]: {
        contract: contract,
        isApprovedForAll,
        tokenIds: tokenIdsObj,
      },
    });
    return res;
  }, [currentAddress, myERC721.instance, renft]);

  const fetchNftMeta = useCallback(async (uris: parse[]) => {
    const toFetch: Promise<Response>[] = [];
    if (uris.length < 1) return [];
    for (const uri of uris) {
      if (!uri.href) continue;
      // additional check here is needed for ZORA links, if it is ZORA URI, then it points to image/media
      // rather than actual meta of the NFT
      if (uri.href.startsWith("https://ipfs.daonomic.com")) {
        const parts = uri.href.split("/");
        const CID = parts[parts.length - 1];
        const pulled = pull({ cids: [CID] })
          .then((dat) => dat[0])
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          .catch(() => ({})) as Promise<any>;
        toFetch.push(pulled);
      } else if (uri.href.startsWith("https://ipfs.fleek.co/ipfs")) {
        // * ZORA will straight up give you the image. No need for ceremonial meta JSON
        const fetched = fetch(uri.href)
          .then(async (r) => {
            const blob = await r.blob();
            const url = URL.createObjectURL(blob);
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            return { image: url, image_url: url } as any;
          })
          .catch(() => ({}));
        toFetch.push(fetched);
      } else {
        const uriToPull = uri.href.startsWith("https://api.sandbox.game")
          ? `${CORS_PROXY}${uri.href}`
          : uri.href;
        // todo: only fetch if https or http
        const fetched = fetch(uriToPull)
          .then(async (dat) => await dat.json())
          .catch(() => ({}));
        toFetch.push(fetched);
      }
    }
    const res = await Promise.all(toFetch);
    return res;
  }, []);

  // some image URIs are pointing to ipfs
  // therfore after the initial meta fetch, the second
  // one (this one) is called to retrieve images from IPFS
  const parseMeta = async (meta: Response[]) => {
    const parsedMeta: Response[] = JSON.parse(JSON.stringify(meta));
    const indicesToUpdate: number[] = [];
    const imagesToFetch: string[] = [];
    let ix = 0;
    for (const m of meta) {
      let key = "";
      if ("image" in m) {
        key = "image";
      } else if ("image_url" in m) {
        key = "image_url";
      }
      if (key) {
        //@ts-ignore
        if (m[key].startsWith("ipfs")) {
          indicesToUpdate.push(ix);
          //@ts-ignore
          const parts = m[key].split("/");
          const cid = parts[parts.length - 1];
          //@ts-ignore
          imagesToFetch.push(cid);
        }
      }
      ix++;
    }
    const fetchedImages = await pull({
      cids: imagesToFetch,
      isBytesFetch: true,
    });
    for (let i = 0; i < indicesToUpdate.length; i++) {
      let blob: Blob;
      try {
        blob = await fetchedImages[i].blob();
      } catch (e) {
        console.warn("could not fetch image blob");
        continue;
      }
      //@ts-ignore
      parsedMeta[indicesToUpdate[i]]["image"] = URL.createObjectURL(blob);
    }
    return parsedMeta;
  };

  // all of the user's erc721s
  // todo: potentially save into cache for future sessions
  const fetchAllERC721 = useCallback(async () => {
    const query = queryAllERC721(currentAddress);
    const response: queryAllERC721T = await request(
      ENDPOINT_EIP721_PROD,
      query
    );
    if (!response || response.tokens.length == 0) return [];
    // todo:  is ENS, doesn't have tokenURI
    const toFetchPaths: Path[] = [];
    const toFetchLinks: parse[] = [];
    // O(n)
    for (const token of response.tokens) {
      const { id, tokenURI } = token;
      // * sometimes the subgraph does not return the URI. For example, for ZORA
      let _tokenURI = tokenURI;
      const [address, tokenId] = id.split("_");
      // if (address.toLowerCase() === ENS_ADDRESS) continue;
      if (!address || !tokenId) continue;
      // this avoids having redundant instantiations of the same ERC721
      if (!erc721s[address]?.contract) {
        // React will bundle up these individual setStates
        const contract = getERC721(address, signer);
        const isApprovedForAll = await contract
          .isApprovedForAll(
            currentAddress,
            /* eslint-disable-next-line */
            renft.instance!.address
          )
          .catch(() => false);
        if (!tokenURI) {
          _tokenURI = await contract
            .tokenURI(BigNumber.from(tokenId))
            .catch(() => "");
        }
        setErc721s((prev) => ({
          ...prev,
          [address]: {
            ...prev.address,
            contract: contract,
            isApprovedForAll,
          },
        }));
      }
      if (!hasPath([address, "tokenIds", tokenId])(erc721s)) {
        if (!_tokenURI) continue;
        toFetchPaths.push([address, "tokenIds", tokenId]);
        toFetchLinks.push(parse(_tokenURI, true));
      }
    }
    const meta = await fetchNftMeta(toFetchLinks);
    // one more pass through the meta to see if any of the images are ipfs
    const parsedMeta = await parseMeta(meta);
    for (let i = 0; i < meta.length; i++) {
      setErc721s((prev) => {
        const setTo = ramdaSet(lensPath(toFetchPaths[i]), parsedMeta[i], prev);
        return setTo;
      });
    }
    // this functions updates erc721s, so it cannot have that as a dep
    /* eslint-disable-next-line */
  }, [currentAddress, renft.instance]);

  // queries ALL of the lendings in reNFT
  const _fetchLending = useCallback(async () => {
    const query = queryLending();
    const data: {
      lendingRentings: LendingRentingRaw[];
    } = await request(
      IS_DEV_ENV ? ENDPOINT_RENFT_DEV : ENDPOINT_RENFT_PROD,
      query
    );
    if (!data) return [];
    const { lendingRentings } = data;
    const resolvedData: Lending[] = [];
    for (let i = 0; i < lendingRentings.length; i++) {
      const numTimesLent = lendingRentings[i].lending.length;
      const numTimesRented = lendingRentings[i].renting?.length ?? 0;
      const isAvailable = numTimesLent === numTimesRented + 1;
      if (!isAvailable) continue;
      const item = parseLending(lendingRentings[i].lending[numTimesLent - 1]);
      resolvedData.push(item);
    }
    return resolvedData;
  }, [parseLending]);

  const _enrichSetLending = useCallback(
    async (nfts: Lending[]): Promise<void> => {
      const toFetchPaths: Path[] = [];
      const toFetchLinks: parse[] = [];
      // todo: silly
      const _nfts: Lending[] = [];
      for (const nft of nfts) {
        if (!lendings[nft.nftAddress]?.contract) {
          const contract = getERC721(nft.nftAddress, signer);
          if (!hasPath([nft.nftAddress, "tokenIds", nft.tokenId])(lendings)) {
            const tokenURI = await contract
              .tokenURI(nft.tokenId)
              .catch(() => undefined);
            if (!tokenURI) continue;
            toFetchPaths.push([nft.nftAddress, "tokenIds", nft.tokenId]);
            toFetchLinks.push(parse(tokenURI, true));
            _nfts.push(nft);
          }
          setLendings((prev) => ({
            ...prev,
            [nft.nftAddress]: {
              ...prev[nft.nftAddress],
              contract: contract,
            },
          }));
        } else {
          if (!hasPath([nft.nftAddress, "tokenIds", nft.tokenId])(lendings)) {
            const tokenURI = await lendings[nft.nftAddress].contract.tokenURI(
              nft.tokenId
            );
            toFetchPaths.push([nft.nftAddress, "tokenIds", nft.tokenId]);
            toFetchLinks.push(parse(tokenURI, true));
            _nfts.push(nft);
          }
        }
      }
      const meta = await fetchNftMeta(toFetchLinks);
      for (let i = 0; i < meta.length; i++) {
        setLendings((prev) => {
          const setTo = ramdaSet(
            lensPath(toFetchPaths[i]),
            {
              ...meta[i],
              id: _nfts[i].id,
              lenderAddress: _nfts[i].lenderAddress,
              maxRentDuration: _nfts[i].maxRentDuration,
              dailyRentPrice: _nfts[i].dailyRentPrice,
              nftPrice: _nfts[i].nftPrice,
              paymentToken: _nfts[i].paymentToken,
              renting: _nfts[i].renting,
              collateralClaimed: _nfts[i].collateralClaimed,
            },
            prev
          );
          return setTo;
        });
      }
    },
    [fetchNftMeta, signer, lendings]
  );

  const fetchLending = useCallback(async () => {
    const nfts = await _fetchLending();
    await _enrichSetLending(nfts);
  }, [_fetchLending, _enrichSetLending]);

  const fetchAvailableNfts = useCallback(async () => {
    if (IS_DEV_ENV) {
      fetchNftMetaDev();
    } else {
      fetchAllERC721();
    }
  }, [fetchAllERC721, fetchNftMetaDev]);

  usePoller(fetchLending, 10 * SECOND_IN_MILLISECONDS);

  useEffect(() => {
    // ! do not remove this line
    if (!currentAddress || !renft.instance || !signer) return;
    // to avoid working with hardhat contracts when in dev env
    // you may switch a network, to test that mainnet works
    // but if you do so, and this wasn't here, you would
    // get a bunch of gibberish errors that would make zero
    // sense and you would waste half a day debugging
    fetchAvailableNfts();
    fetchLending();
  }, [
    currentAddress,
    renft.instance,
    signer,
    fetchAvailableNfts,
    fetchLending,
  ]);

  return (
    <GraphContext.Provider
      value={{ erc721s, fetchAvailableNfts, lendings, rentings }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
