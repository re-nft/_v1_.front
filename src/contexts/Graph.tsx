import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { request } from "graphql-request";
import Web3 from "web3";

// contexts
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
        address
        lender
        borrower
        maxDuration
        actualDuration
        borrowedAt
        borrowPrice
        nftPrice
        face {
          uri
        }
      }
      borrowing {
        id
        address
        lender
        borrower
        maxDuration
        actualDuration
        borrowedAt
        borrowPrice
        nftPrice
        face {
          uri
        }
      }
      faces {
        id
        uri
      }
      approvals {
        id,
        nftAddress,
        tokenId,
        owner,
        approved
      }
      approvedAll {
        id,
        nftAddress,
        owner,
        approved
      }
    }
  }`;
};

type GraphProviderProps = {
  children: React.ReactNode;
};

export const GraphProvider: React.FC<GraphProviderProps> = ({ children }) => {
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
