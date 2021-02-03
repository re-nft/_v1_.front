import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { request } from "graphql-request";
import { ethers } from "ethers";
import parse from "url-parse";
import { set as ramdaSet, lensPath, hasPath } from "ramda";

import { Optional } from "../types";
import { CurrentAddressContext } from "../hardhat/SymfoniContext";
import { getERC1155, getERC721 } from "../utils";
import { copyFileSync } from "fs";
import { isConstructorDeclaration } from "typescript";

// type GraphContextType = {
//   user: User;
//   lending: Lending[];
// };

const ENDPOINT = "https://api.thegraph.com/subgraphs/name/nazariyv/rentnft";
const HTTPS_PROTOCOL = "https:";
const HTTP_PROTOCOL = "http:";

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
    contract?: ethers.Contract;
    // tokenId string to response
    tokenIds: {
      [key: string]: {
        meta?: Response;
      };
    };
  };
};

type GraphContextType = {
  erc721s: AddressToErc721;
};

const DefaultGraphContext: GraphContextType = {
  erc721s: {},
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

// queries all of the lendings on the platform
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

// user(id: "${web3.utils.toHex(user).toLowerCase()}") {
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

type RawLending = {
  id: string;
  nftAddress: string;
  tokenId: string;
  lenderAddress: string;
  maxRentDuration: string;
  dailyRentPrice: string;
  nftPrice: string;
  paymentToken: string;
  collateralClaimed: string;
  renting: Omit<RawRenting, "lending">;
};

type RawLendingRenting = {
  id: string; // this is set as `nftAddress::tokenId`
  lending: RawLending[];
  renting?: RawRenting[];
};

type RawRenting = {
  id: string;
  rentDuration: string;
  rentedAt: string;
  renterAddress: string;
  lending: RawLending;
};

export const GraphProvider: React.FC = ({ children }) => {
  const [currentAddress] = useContext(CurrentAddressContext);
  const [erc721s, setErc721s] = useState<AddressToErc721>({});

  const fetchNftMeta = async (uris: parse[]) => {
    const toFetch: Promise<Response>[] = [];

    if (uris.length < 1) return [];

    // console.log("uris", uris);

    for (const uri of uris) {
      if (!uri.href) continue;
      toFetch.push(
        fetch(uri.href)
          .then(async (dat) => await dat.json())
          .catch(() => ({}))
      );
    }

    // console.log("toFetch", toFetch);

    const res = await Promise.all(toFetch);

    // console.log(res);

    return res;
  };

  const fetchAllERC721 = useCallback(async () => {
    if (!currentAddress) return [];
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
        setErc721s((prev) => ({
          ...prev,
          [address]: {
            ...prev.address,
            contract: getERC721(address),
          },
        }));
      }

      if (!hasPath([address, "tokenIds", tokenId])(erc721s)) {
        toFetchPaths.push([address, "tokenIds", tokenId]);
        toFetchLinks.push(parse(tokenURI, true));
      }
      // toFetch.push([[address, "tokenIds", tokenId], parse(tokenURI, true)]);
      // toFetchLinks.push(parse(tokenURI, true));
    }

    const meta = await fetchNftMeta(toFetchLinks);

    for (let i = 0; i < meta.length; i++) {
      setErc721s((prev) => {
        const setTo = ramdaSet(lensPath(toFetchPaths[i]), meta[i], prev);
        // console.log(`setting to ${i}`, { ...prev, ...setTo });
        // console.log("setting to", setTo);
        return setTo;
      });
    }
  }, [currentAddress]);

  // queries ALL of the lendings in reNFT
  const fetchLending = async () => {
    const query = queryLending();
    const __data: Optional<{
      lendingRentings: RawLendingRenting[];
    }> = await request(ENDPOINT, query);
    if (!__data) return [];
    const _data = __data.lendingRentings;

    const data: RawLending[] = [];

    // the same NFT could be re-lent multiple times
    // only the last in the queue can be available
    for (let i = 0; i < _data.length; i++) {
      const numOfLendings = _data[i].lending.length;
      const numOfRentings = _data[i].renting?.length || 0;
      const isAvailable = numOfLendings - 1 === numOfRentings;

      // if there is one extra lending, then that means it is avilable
      if (!isAvailable) continue;

      if (numOfLendings > 1) {
        data.push(_data[i].lending[numOfLendings - 1]);
      } else if (numOfLendings === 1) {
        data.push(_data[i].lending[0]);
      }
    }
  };

  useEffect(() => {
    fetchAllERC721();
  }, [fetchAllERC721]);

  return (
    <GraphContext.Provider value={{ erc721s }}>
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
