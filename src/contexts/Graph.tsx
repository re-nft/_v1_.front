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
  isApproved: (
    address: string,
    nftAddress: string,
    tokenId?: string
  ) => boolean;
};

const DefaultGraphContext: GraphContextType = {
  isApproved: () => {
    throw new Error("must be implemented");
  },
};

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
    if (!web3 || !wallet?.account) {
      console.debug("connect to goerli network");
      return;
    }
    const userQuery = queryUser(wallet.account, web3);
    const data = await request(ENDPOINT, userQuery);
    setUser(data.user);
  }, [wallet?.account, web3]);

  const _isApprovedAll = useCallback(
    (address: string, nftAddress: string) => {
      if (!web3 || !wallet?.account || !user) {
        console.debug("can't verify if approved");
        return false;
      }
      let allApproved = false;
      try {
        const allApprovals = user.approvedAll;
        allApproved = allApprovals.some(
          (all) =>
            all.approved.toLowerCase() === address.toLowerCase() &&
            all.nftAddress.toLowerCase() === nftAddress.toLowerCase()
        );
      } catch (err) {
        console.debug("unexpected error when checking if user is approved");
        return false;
      }
      return allApproved;
    },
    [wallet?.account, web3, user]
  );

  // checks if wallet.account has approved address
  // to handle nftAddress and optionally tokenId
  const isApproved = useCallback(
    (address: string, nftAddress: string, tokenId?: string) => {
      if (!web3 || !wallet?.account || !user) {
        console.debug("can't verify if approved");
        return false;
      }
      let approved = false;
      try {
        approved = _isApprovedAll(address, nftAddress);
        if (approved) return true;
        if (!tokenId) return false;
        approved = user.approvals.some(
          (approval) =>
            approval.approved.toLowerCase() === address.toLowerCase() &&
            approval.nftAddress.toLowerCase() === nftAddress.toLowerCase()
        );
      } catch (err) {
        console.debug("unexpected error when checking if user is approved");
        return false;
      }
      return approved;
    },
    [wallet?.account, web3, user, _isApprovedAll]
  );

  const refresh = useCallback(async () => {
    await Promise.all([getNfts(), getUser()]);
  }, [getNfts, getUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <GraphContext.Provider value={{ nfts, user, isApproved }}>
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
