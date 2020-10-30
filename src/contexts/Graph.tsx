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

import { Nft, User } from "../types";

type GraphContextType = {
  nfts?: Nft[];
  user?: User;
};

const DefaultGraphContext: GraphContextType = {};

const GraphContext = createContext<GraphContextType>(DefaultGraphContext);

const ENDPOINT = "https://api.thegraph.com/subgraphs/name/nazariyv/rentnft";

const queryNft = `{
  nfts {
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
      id
      uri
    }
  }
}`;

const queryUser = (user: string, web3: Web3): string => {
  return `{
    user(id: "${web3.utils.toHex(user)}") {
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
    }
  }`;
};

type GraphProviderProps = {
  children: React.ReactNode;
};

export const GraphProvider: React.FC<GraphProviderProps> = ({ children }) => {
  const { wallet, web3 } = useContext(DappContext);

  const [nfts, setNfts] = useState<Nft[]>();
  const [user, setUser] = useState<User>();

  const getNfts = useCallback(async () => {
    const data = await request(ENDPOINT, queryNft);
    if ("nfts" in data && data["nfts"].length !== 0) {
      const nftsData = data["nfts"];
      setNfts(nftsData);
    }
  }, []);

  const getUser = useCallback(async () => {
    if (web3 == null || wallet == null || !wallet.account) {
      console.debug("connect to goerli network");
      return;
    }
    const userQuery = queryUser(wallet.account, web3);
    const data = await request(ENDPOINT, userQuery);
    setUser(data.user);
  }, [wallet, web3]);

  const refresh = useCallback(async () => {
    await Promise.all([getNfts(), getUser()]);
  }, [getNfts, getUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <GraphContext.Provider value={{ nfts, user }}>
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
