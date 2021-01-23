import React, { createContext, useCallback, useEffect } from "react";
import { request } from "graphql-request";

import { Lending, User, Optional } from "../types";

// type GraphContextType = {
//   user: User;
//   lending: Lending[];
// };

type GraphContextType = {
  user: any;
  lending: any;
};

const DefaultGraphContext: GraphContextType = {
  user: {
    id: "",
    lending: [],
    renting: [],
  },
  lending: [],
};

const GraphContext = createContext<GraphContextType>(DefaultGraphContext);

const ENDPOINT = "https://api.thegraph.com/subgraphs/name/nazariyv/rentnft";

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
  // queries ALL of the lendings in reNFT
  const fetchLending = useCallback(async () => {
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
  }, []);

  const refresh = useCallback(async () => {
    await fetchLending();
  }, [fetchLending]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <GraphContext.Provider value={{ user: null, lending: null }}>
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
