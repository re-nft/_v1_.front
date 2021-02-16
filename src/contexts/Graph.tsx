import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { request } from "graphql-request";
import parse from "url-parse";
import { set as ramdaSet, lensPath, hasPath } from "ramda";
import { ethers } from "ethers";

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
  LendingRenting,
  LendingRaw,
  Lending,
  Renting,
  RentingRaw,
} from "../types/graph";
import { SECOND_IN_MILLISECONDS, DP18 } from "../consts";
import { PaymentToken } from "../types";
import { LensTwoTone } from "@material-ui/icons";

const IS_DEV_ENV =
  process.env["REACT_APP_ENVIRONMENT"]?.toLowerCase() === "development";

const ENDPOINT_PROD =
  "https://api.thegraph.com/subgraphs/name/nazariyv/rentnft";
const ENDPOINT_DEV = "http://localhost:8000/subgraphs/name/nazariyv/ReNFT";

const ENDPOINT = IS_DEV_ENV ? ENDPOINT_DEV : ENDPOINT_PROD;

// kudos to Luis: https://github.com/microchipgnu
// check out his latest on: https://twitter.com/microchipgnu
// and of course kudos to the Solidity God: wighawag
const ENDPOINT_EIP721 =
  "https://api.thegraph.com/subgraphs/name/wighawag/eip721-subgraph";

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
  const [currentAddress] = useContext(CurrentAddressContext);
  const [signer] = useContext(SignerContext);
  const [erc721s, setErc721s] = useState<AddressToErc721>({});
  const [lendings, setLendings] = useState<AddressToLending>({});
  const [rentings, setRentings] = useState<AddressToRenting>({});

  const myERC721 = useContext(MyERC721Context);
  const renft = useContext(RentNftContext);

  const parseLending = (lending: LendingRaw): Lending => {
    return {
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
  };

  // ! only used in dev environment
  const fetchNftMetaDev = useCallback(async () => {
    if (!myERC721.instance) return [];
    if (!renft.instance) return [];
    const toFetch: Promise<Response>[] = [];
    const tokenIds: string[] = [];
    const contract = myERC721.instance;
    // * won't fetch in prod
    // pull all of the tokens of the current address
    const numNfts = (await contract.balanceOf(currentAddress)) ?? 0;
    for (let i = 0; i < numNfts.toNumber(); i++) {
      // get the tokenId, and then fetch the metadata uri, then push this to toFetch
      const tokenId =
        (await contract.tokenOfOwnerByIndex(currentAddress, i)) ?? -1;
      tokenIds.push(tokenId.toString());
      const metaURI = await contract.tokenURI(tokenId);
      if (metaURI)
        toFetch.push(
          fetch(metaURI)
            .then(async (dat) => await dat.json())
            .catch(() => ({}))
        );
    }
    const res = await Promise.all(toFetch);
    const tokenIdsObj = {};
    for (let i = 0; i < res.length; i++) {
      Object.assign(tokenIdsObj, { [tokenIds[i]]: res[i] });
    }
    setErc721s({
      [contract.address]: {
        contract: contract,
        isApprovedForAll: await contract.isApprovedForAll(
          currentAddress,
          renft.instance.address
        ),
        tokenIds: tokenIdsObj,
      },
    });
    return res;
  }, [currentAddress, myERC721.instance, renft]);

  const fetchNftMeta = async (uris: parse[]) => {
    const toFetch: Promise<Response>[] = [];
    if (uris.length < 1) return [];
    for (const uri of uris) {
      if (!uri.href) continue;
      // todo: only fetch if https or http
      toFetch.push(
        fetch(uri.href)
          .then(async (dat) => await dat.json())
          .catch(() => ({}))
      );
    }
    const res = await Promise.all(toFetch);
    return res;
  };

  // all of the user's erc721s
  // todo: potentially save into cache for future sessions
  const fetchAllERC721 = useCallback(async () => {
    if (!currentAddress || !renft.instance) return [];
    const query = queryAllERC721(currentAddress);
    const response: queryAllERC721T = await request(ENDPOINT_EIP721, query);
    if (!response) return [];
    if (response.tokens.length == 0) return [];

    const toFetchPaths: Path[] = [];
    const toFetchLinks: parse[] = [];

    // O(n)
    for (const token of response.tokens) {
      const { id, tokenURI } = token;
      const [address, tokenId] = id.split("_");
      if (!address || !tokenId) continue;
      // this avoids having redundant instantiations of the same ERC721
      if (!erc721s[address]?.contract) {
        // React will bundle up these individual setStates
        const contract = getERC721(address);
        const isApprovedForAll = contract
          ? await contract.isApprovedForAll(
              currentAddress,
              renft.instance.address
            )
          : false;
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
        toFetchPaths.push([address, "tokenIds", tokenId]);
        toFetchLinks.push(parse(tokenURI, true));
      }
    }

    const meta = await fetchNftMeta(toFetchLinks);
    for (let i = 0; i < meta.length; i++) {
      setErc721s((prev) => {
        const setTo = ramdaSet(lensPath(toFetchPaths[i]), meta[i], prev);
        return setTo;
      });
    }
    // this functions updates erc721s, so it cannot have that as a dep
    /* eslint react-hooks/exhaustive-deps: "off" */
  }, [currentAddress, renft.instance]);

  // queries ALL of the lendings in reNFT
  const _fetchLending = useCallback(async () => {
    const query = queryLending();
    const data: {
      lendingRentings: LendingRentingRaw[];
    } = await request(ENDPOINT, query);
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
      if (!currentAddress || !renft.instance || !signer) {
        console.warn("could not enrich lending, yet.");
        return;
      }
      const toFetchPaths: Path[] = [];
      const toFetchLinks: parse[] = [];
      for (const nft of nfts) {
        if (!lendings[nft.nftAddress]?.contract) {
          const contract = getERC721(nft.nftAddress, signer);
          // const isApprovedForAll = await contract.isApprovedForAll(
          //   ethers.utils.getAddress(currentAddress),
          //   ethers.utils.getAddress(renft.instance.address)
          // );
          if (!hasPath([nft.nftAddress, "tokenIds", nft.tokenId])(lendings)) {
            const tokenURI = await contract.tokenURI(nft.tokenId);
            toFetchPaths.push([nft.nftAddress, "tokenIds", nft.tokenId]);
            toFetchLinks.push(parse(tokenURI, true));
          }
          setLendings((prev) => ({
            ...prev,
            [nft.nftAddress]: {
              ...prev[nft.nftAddress],
              contract: contract,
            },
          }));
        }
      }
      const meta = await fetchNftMeta(toFetchLinks);
      for (let i = 0; i < meta.length; i++) {
        setLendings((prev) => {
          const setTo = ramdaSet(lensPath(toFetchPaths[i]), meta[i], prev);
          return setTo;
        });
      }
    },
    [currentAddress, renft.instance, getERC721, fetchNftMeta, signer]
  );

  const fetchLending = useCallback(async () => {
    const nfts = await _fetchLending();
    await _enrichSetLending(nfts);
  }, [_fetchLending, _enrichSetLending]);

  usePoller(fetchLending, 10 * SECOND_IN_MILLISECONDS);

  const fetchAvailableNfts = useCallback(() => {
    fetchAllERC721();
    if (IS_DEV_ENV) fetchNftMetaDev();
  }, [fetchAllERC721, IS_DEV_ENV, fetchNftMetaDev]);

  useEffect(() => {
    fetchAvailableNfts();
  }, []);

  return (
    <GraphContext.Provider
      value={{ erc721s, fetchAvailableNfts, lendings, rentings }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
