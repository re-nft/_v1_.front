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
import ContractsContext from "./Contracts";

import { Lending, Renting, User, Optional, Address } from "../types";
import { toPaymentToken, toUnpackedPrice } from "../contracts";

type GraphContextType = {
  user: User;
  lending: Lending[];
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

type RawRenting = {
  id: string;
  rentDuration: string;
  rentedAt: string;
  renterAddress: string;
  lending: RawLending;
};

export const GraphProvider: React.FC = ({ children }) => {
  const { wallet, web3 } = useContext(DappContext);
  const { erc721 } = useContext(ContractsContext);

  const [user, setUser] = useState<User>({ id: "", lending: [], renting: [] });
  const [lending, setLending] = useState<Lending[]>([]);

  const _parseLending = useCallback(
    async ({ data }: { data?: RawLending[] }) => {
      if (!data || data.length < 1) return [];
      const fetchImagesFor: Promise<string>[] = [];

      const resolvedData: Omit<Lending, "imageUrl">[] = data.map((datum) => {
        fetchImagesFor.push(erc721.tokenURI(datum.nftAddress, datum.tokenId));
        // todo: this will only work for gan addresses
        // * make this work for for open sea too
        return {
          id: Number(datum.id),
          nftAddress: datum.nftAddress,
          tokenId: Number(datum.tokenId),
          lenderAddress: datum.lenderAddress,
          maxRentDuration: Number(datum.maxRentDuration),
          dailyRentPrice: toUnpackedPrice(datum.dailyRentPrice),
          nftPrice: toUnpackedPrice(datum.nftPrice),
          paymentToken: toPaymentToken(datum.paymentToken),
          collateralClaimed: Boolean(datum.collateralClaimed),
        };
      });

      const imageUrls = await Promise.all(fetchImagesFor);

      const resolvedLending: Lending[] = resolvedData.map((datum, index) => ({
        ...datum,
        imageUrl: imageUrls[index],
      }));

      return resolvedLending;
    },
    [erc721]
  );

  // todo: bad time complexity. O(2N + M)
  const _parseRenting = useCallback(
    async ({ data }: { data?: RawRenting[] }) => {
      if (!data || data.length < 1) return [];
      const lendingsToParse: RawLending[] = [];

      const resolvedData: Omit<Renting, "lending">[] = data.map((datum) => {
        lendingsToParse.push(datum.lending);
        return {
          id: Number(datum.id),
          renterAddress: datum.renterAddress,
          rentedAt: Number(datum.rentedAt),
          rentDuration: Number(datum.rentDuration),
        };
      });

      const parsedLending = await _parseLending({ data: lendingsToParse });

      const _resolvedData: Renting[] = resolvedData.map((v, ix) => ({
        ...v,
        lending: parsedLending[ix],
      }));

      return _resolvedData;
    },
    [_parseLending]
  );

  // parses user's lendings and rentings
  const _parseUser = useCallback(
    async ({
      data,
    }: {
      data: {
        id: Address;
        lending: RawLending[];
        renting: RawRenting[];
      };
    }) => {
      const lendings = await _parseLending({ data: data.lending });
      const rentings = await _parseRenting({ data: data.renting });

      const user: User = {
        id: data.id,
        lending: lendings,
        renting: rentings,
      };

      return user;
    },
    [_parseLending, _parseRenting]
  );

  const getUser = useCallback(async () => {
    if (!web3 || !wallet?.account) {
      console.debug("connect to goerli network");
      return;
    }
    const userQuery = queryUser(wallet.account, web3);
    const data = await request(ENDPOINT, userQuery);
    const resovledData = await _parseUser({ data: data.user });
    setUser(resovledData);
  }, [wallet?.account, web3, _parseUser]);

  // queries ALL of the lendings in reNFT
  const fetchLending = useCallback(async () => {
    const query = queryLending();
    const data: Optional<RawLending[]> = (await request(ENDPOINT, query))
      .lendings;
    if (!data) return [];

    const resolvedData = await _parseLending({ data });

    setLending(resolvedData);
  }, [_parseLending]);

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
