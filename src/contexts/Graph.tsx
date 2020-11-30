import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { request } from "graphql-request";
import Web3 from "web3";

import DappContext from "./Dapp";

import { User } from "../types";

type GraphContextType = {
  user?: User;
};

const DefaultGraphContext: GraphContextType = {};

const GraphContext = createContext<GraphContextType>(DefaultGraphContext);

// TODO: move to production endpoint
const ENDPOINT = "https://api.thegraph.com/subgraphs/name/nazariyv/rentnft";

const queryUser = (user: string, web3: Web3): string => {
  return `{
    user(id: "${web3.utils.toHex(user).toLowerCase()}") {
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
  const { wallet, web3 } = useContext(DappContext);

  const [user, setUser] = useState<User>();

  const getUser = useCallback(async () => {
    if (!web3 || !wallet?.account) {
      console.debug("connect to goerli network");
      return;
    }
    const userQuery = queryUser(wallet.account, web3);
    const data = await request(ENDPOINT, userQuery);
    setUser(data.user);
  }, [wallet?.account, web3]);

  const refresh = useCallback(async () => {
    await getUser();
  }, [getUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <GraphContext.Provider value={{ user }}>{children}</GraphContext.Provider>
  );
};

export default GraphContext;
