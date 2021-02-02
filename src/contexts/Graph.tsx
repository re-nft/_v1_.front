import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { request } from "graphql-request";

import { Optional } from "../types";
import { CurrentAddressContext } from "../hardhat/SymfoniContext";

// type GraphContextType = {
//   user: User;
//   lending: Lending[];
// };

const DefaultGraphContext: GraphContextType = {
  user: {
    id: "",
    lending: [],
    renting: [],
  },
  lending: [],
  erc721s: [],
};

const GraphContext = createContext<GraphContextType>(DefaultGraphContext);

const ENDPOINT = "https://api.thegraph.com/subgraphs/name/nazariyv/rentnft";

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

type GraphContextType = {
  user: any;
  lending: any;
  erc721s: queryAllERC721T["tokens"];
};

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
const queryUser = (user: string, web3: any): string => {
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
  const [myERC721s, setMyERC721s] = useState<queryAllERC721T["tokens"]>([]);

  const fetchAllERC721 = useCallback(async () => {
    if (!currentAddress) return [];
    const query = queryAllERC721(currentAddress);
    const response: queryAllERC721T = await request(ENDPOINT_EIP721, query);
    if (!response) return [];
    if (response.tokens.length == 0) return [];
    setMyERC721s(response.tokens);
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
    <GraphContext.Provider
      value={{ user: null, lending: null, erc721s: myERC721s }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
