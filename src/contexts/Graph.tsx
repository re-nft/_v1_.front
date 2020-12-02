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

import { Lending, User, Optional } from "../types";
import { toPaymentToken, toUnpackedPrice } from "../contracts";

type GraphContextType = {
  user?: User;
  lending: Lending[];
};

const DefaultGraphContext: GraphContextType = {
  lending: [],
};

const GraphContext = createContext<GraphContextType>(DefaultGraphContext);

const ENDPOINT = "https://api.thegraph.com/subgraphs/name/nazariyv/rentnft";

const queryLending = (): string => {
  return `{
    lendings {
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
  }`;
};

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

type RawLending = {
  collateralClaimed: string;
  dailyRentPrice: string;
  id: string;
  lenderAddress: string;
  maxRentDuration: string;
  nftAddress: string;
  nftPrice: string;
  paymentToken: string;
  tokenId: string;
};

export const GraphProvider: React.FC = ({ children }) => {
  const { wallet, web3 } = useContext(DappContext);

  const [user, setUser] = useState<User>();
  const [lending, setLending] = useState<Lending[]>([]);

  const getUser = useCallback(async () => {
    if (!web3 || !wallet?.account) {
      console.debug("connect to goerli network");
      return;
    }
    const userQuery = queryUser(wallet.account, web3);
    const data = await request(ENDPOINT, userQuery);
    setUser(data.user);
  }, [wallet?.account, web3]);

  const _parseLending = ({ data }: { data: RawLending[] }) => {
    const resolvedData: Lending[] = data.map((datum) => ({
      id: Number(datum.id),
      nftAddress: datum.nftAddress,
      tokenId: Number(datum.tokenId),
      lenderAddress: datum.lenderAddress,
      maxRentDuration: Number(datum.maxRentDuration),
      dailyRentPrice: toUnpackedPrice(datum.dailyRentPrice),
      nftPrice: toUnpackedPrice(datum.nftPrice),
      paymentToken: toPaymentToken(datum.paymentToken),
      collateralClaimed: Boolean(datum.collateralClaimed),
    }));
    console.log("resolved data is");
    console.log(resolvedData);
    return resolvedData;
  };

  const fetchLending = useCallback(async () => {
    const query = queryLending();
    const data: Optional<RawLending[]> = (await request(ENDPOINT, query))
      .lendings;
    if (!data) return [];

    const resolvedData = _parseLending({ data });

    setLending(resolvedData);
  }, []);

  const refresh = useCallback(async () => {
    await getUser();
    await fetchLending();
  }, [getUser, fetchLending]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <GraphContext.Provider value={{ user, lending }}>
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
