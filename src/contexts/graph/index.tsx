import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { request } from "graphql-request";

import {
  CurrentAddressContext,
  ReNFTContext,
  SignerContext,
} from "../../hardhat/SymfoniContext";
import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../../consts";
import { timeItAsync } from "../../utils";
import createCancellablePromise from "../create-cancellable-promise";
import {
  queryAllRenft,
  queryUserLendingRenft,
  queryUserRentingRenft,
  queryAllLendingRenft,
  queryAllRentingRenft,
  queryMyERC721s,
  queryMyERC1155s,
} from "./queries";
import {
  getUserDataOrCrateNew,
  getAllUsersVote,
} from "../../services/firebase";
import { calculateVoteByUsers } from "../../services/vote";
import {
  NftRaw,
  ERC1155s,
  ERC721s,
  NftToken,
  UserData,
  CalculatedUserVote,
  UsersVote,
  LendingRaw,
} from "./types";
import { Nft, Lending, Renting } from "./classes";
import useFetchNftDev from "./hooks/useFetchNftDev";

/**
 * Useful links
 * https://api.thegraph.com/subgraphs/name/wighawag/eip721-subgraph
 * https://api.thegraph.com/subgraphs/name/amxx/eip1155-subgraph
 * https://github.com/0xsequence/token-directory
 *
 * Kudos to
 * Luis: https://github.com/microchipgnu
 * Solidity God: wighawag
 */
const IS_PROD =
  process.env["REACT_APP_ENVIRONMENT"]?.toLowerCase() === "production";

// TODO: environment variables

// renft localhost and prod subgraph for pulling NFTs related to reNFT
const ENDPOINT_RENFT_PROD =
  "https://api.thegraph.com/subgraphs/name/nazariyv/rentnft";
const ENDPOINT_RENFT_DEV =
  "http://localhost:8000/subgraphs/name/nazariyv/ReNFT";

// non-reNFT prod subgraphs for pulling your NFT balances
const ENDPOINT_EIP721_PROD =
  "https://api.thegraph.com/subgraphs/name/wighawag/eip721-subgraph";
const ENDPOINT_EIP1155_PROD =
  "https://api.thegraph.com/subgraphs/name/amxx/eip1155-subgraph";

type LendingId = string;
type RentingId = LendingId;

type GraphContextType = {
  userData: UserData;
  usersVote: UsersVote;
  calculatedUsersVote: CalculatedUserVote;
  getUserNfts(): Promise<Nft[] | undefined>;
  getUserLending(): Promise<Lending[] | undefined>;
  getUsersLending(): Promise<Lending[] | undefined>;
  getUserRenting(): Promise<Renting[] | undefined>;
  getUserData(): Promise<UserData | undefined>;
  updateGlobalUserData(): Promise<void>;
};

const defaultUserData = {
  favorites: {},
};

const DefaultGraphContext: GraphContextType = {
  userData: defaultUserData,
  usersVote: {},
  calculatedUsersVote: {},
  getUserNfts: () => Promise.resolve([]),
  getUserLending: () => Promise.resolve([]),
  getUsersLending: () => Promise.resolve([]),
  getUserRenting: () => Promise.resolve([]),
  getUserData: () => Promise.resolve(defaultUserData),
  updateGlobalUserData: () => Promise.resolve(),
};

enum FetchType {
  ERC721,
  ERC1155,
}

const GraphContext = createContext<GraphContextType>(DefaultGraphContext);

export const GraphProvider: React.FC = ({ children }) => {
  const [currentAddress] = useContext(CurrentAddressContext);
  const [signer] = useContext(SignerContext);
  const { instance: renft } = useContext(ReNFTContext);
  const [_usersLending, _setUsersLending] = useState<LendingId[]>([]);
  const [_usersRenting, _setUsersRenting] = useState<RentingId[]>([]);
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [calculatedUsersVote, setCalculatedUsersVote] =
    useState<CalculatedUserVote>({});
  const [usersVote, setUsersVote] = useState<UsersVote>({});
  /**
   * Only for dev purposes
   */
  const fetchNftDev = useFetchNftDev(signer);

  /**
   * Pings the eip721 and eip1155 subgraphs in prod, to determine what
   * NFTs you own
   */
  const fetchUserProd = useCallback(
    async (fetchType: FetchType) => {
      let query = "";
      let subgraphURI = "";

      switch (fetchType) {
        case FetchType.ERC721:
          query = queryMyERC721s(currentAddress);
          subgraphURI = ENDPOINT_EIP721_PROD;
          break;
        case FetchType.ERC1155:
          query = queryMyERC1155s(currentAddress);
          subgraphURI = ENDPOINT_EIP1155_PROD;
          break;
      }

      const response: ERC721s | ERC1155s = await timeItAsync(
        `Pulled My ${FetchType[fetchType]} NFTs`,
        async () => await request(subgraphURI, query)
      );

      let tokens: NftToken[] = [];
      switch (fetchType) {
        case FetchType.ERC721:
          tokens = (response as ERC721s).tokens.map((token) => {
            // ! in the case of ERC721 the raw tokenId is in fact `${nftAddress}_${tokenId}`
            const [address, tokenId] = token.id.split("_");
            return {
              address,
              tokenURI: token.tokenURI,
              tokenId,
              isERC721: true,
            };
          });
          break;
        case FetchType.ERC1155:
          tokens = (response as ERC1155s).account.balances.map(({ token }) => ({
            address: token.registry.contractAddress,
            tokenURI: token.tokenURI,
            tokenId: token.tokenId,
            isERC721: false,
          }));
          break;
      }

      // TODO: compute hash of the fetch, and everything, to avoid resetting the state, if
      // TODO: nothing has changed
      return tokens;
    },
    // ! do not add nfts as a dep, will cause infinite loop
    /* eslint-disable-next-line */
    [currentAddress, renft?.address, signer]
  );

  const fetchUsersNfts = async (): Promise<Nft[] | undefined> => {
    if (!signer) return undefined;
    let _usersNfts: Nft[] = [];

    // // ! comment this out to test prod NFT rendering in dev env
    // if (process.env.REACT_APP_ENVIRONMENT !== "development") {
    const usersNfts721 = await fetchUserProd(FetchType.ERC721);
    const usersNfts1155 = await fetchUserProd(FetchType.ERC1155);
    // ! lentAmount = "0"
    _usersNfts = usersNfts721.concat(usersNfts1155).map((nft) => {
      return new Nft(nft.address, nft.tokenId, "0", nft.isERC721, signer, {
        meta: nft.meta,
        tokenURI: nft.tokenURI,
      });
    });
    // }

    let _nfts: Nft[] = _usersNfts;
    if (!IS_PROD) {
      const devNfts = await fetchNftDev();
      _nfts = devNfts.concat(_nfts);
    }

    return _nfts;
  };

  // TODO: these should be used instead of fetching all!
  const fetchUserLending = async (): Promise<string[] | undefined> => {
    if (!currentAddress) return;
    const query = queryUserLendingRenft(currentAddress);
    const subgraphURI = IS_PROD ? ENDPOINT_RENFT_PROD : ENDPOINT_RENFT_DEV;
    const response: {
      user?: { lending?: { tokenId: LendingId; nftAddress: string }[] };
    } = await timeItAsync(
      "Pulled My Renft Lending Nfts",
      async () => await request(subgraphURI, query)
    );

    return (
      response.user?.lending?.map(
        ({ tokenId, nftAddress }) =>
          `${nftAddress}${RENFT_SUBGRAPH_ID_SEPARATOR}${tokenId}`
      ) ?? []
    );
  };

  // TODO: these should be used instead of fetching all!
  const fetchUserRenting = async (): Promise<string[] | undefined> => {
    if (!currentAddress) return;
    const query = queryUserRentingRenft(currentAddress);
    const subgraphURI = IS_PROD ? ENDPOINT_RENFT_PROD : ENDPOINT_RENFT_DEV;
    const response: {
      user?: { renting?: { id: RentingId; lending: LendingRaw }[] };
    } = await timeItAsync(
      "Pulled My Renft Renting Nfts",
      async () => await request(subgraphURI, query)
    );
    return (
      response.user?.renting?.map(
        ({ lending }) =>
          `${lending.nftAddress}${RENFT_SUBGRAPH_ID_SEPARATOR}${lending.id}`
      ) ?? []
    );
  };

  /**
   * Sets the renftsLending and renftsRenting state. These are mappings from
   * lending id, renting id respectively to Lending, Renting instances,
   * respectively. These are all the NFTs on reNFT platform
   */
  type ReturnReNftAll = {
    lending: {
      [key: string]: Lending;
    };
    renting: {
      [key: string]: Renting;
    };
  };
  const fetchRenftsAll = async (): Promise<ReturnReNftAll | undefined> => {
    if (!signer) return;
    const query = queryAllRenft();
    const subgraphURI = IS_PROD ? ENDPOINT_RENFT_PROD : ENDPOINT_RENFT_DEV;

    const response: NftRaw = await timeItAsync(
      "Pulled All Renft Nfts",
      async () => await request(subgraphURI, query)
    );

    const _allRenftsLending: { [key: string]: Lending } = {};
    const _allRenftsRenting: { [key: string]: Renting } = {};

    response?.nfts.forEach(({ id, lending, renting }) => {
      const [address, tokenId] = id.split(RENFT_SUBGRAPH_ID_SEPARATOR);
      lending?.forEach((l) => {
        _allRenftsLending[id] = new Lending(l, signer);
      });
      // TODO: -1
      renting?.forEach((r) => {
        _allRenftsRenting[id] = new Renting(address, tokenId, "-1", signer, r);
      });
    });

    return { lending: _allRenftsLending, renting: _allRenftsRenting };
  };

  // PUBLIC API

  // AVAILABLE TO LEND
  const getUserNfts = async (): Promise<Nft[] | undefined> => {
    const allNfts = await fetchUsersNfts();
    return allNfts;
  };

  // ALL AVAILABLE TO RENT (filter out the ones that I am lending)
  const getAlllending = async (): Promise<Lending[] | undefined> => {
    if (!signer) return undefined;

    const _currentAddress = currentAddress ? currentAddress : "";
    const subgraphURI = IS_PROD ? ENDPOINT_RENFT_PROD : ENDPOINT_RENFT_DEV;
    const response: { data: { lendings: LendingRaw[] } } = await timeItAsync(
      "Pulled All ReNFT Lendings",
      async () => await request(subgraphURI, queryAllLendingRenft)
    );

    const lendingsReNFT = [];

    for (const lending of Object.values(response?.data?.lendings)) {
      if (lending.lenderAddress.toLowerCase() === _currentAddress.toLowerCase())
        continue;
      lendingsReNFT.push(new Lending(lending, signer));
    }
    return lendingsReNFT;
  };

  // TODO: inefficient to be fecthingRenftsAll in both user lending and user renting?

  // LENDING
  const getUserLending = async (): Promise<Lending[] | undefined> => {
    if (!signer) return undefined;

    const subgraphURI = IS_PROD ? ENDPOINT_RENFT_PROD : ENDPOINT_RENFT_DEV;
    const response: { users: { lending: LendingRaw[] }[] } = await timeItAsync(
      "Pulled Users ReNFT Lendings",
      async () =>
        await request(subgraphURI, queryUserLendingRenft(currentAddress))
    );

    if (!response?.users[0]) return undefined;

    const lendings = Object.values(response.users[0].lending).map(
      (lending) => new Lending(lending, signer)
    );

    return lendings;
  };

  // RENTING
  const getUserRenting = async (): Promise<Renting[] | undefined> => {
    const renftAll = await fetchRenftsAll();
    if (renftAll) {
      return Object.values(renftAll.renting) || [];
    }
    return undefined;
  };

  const getUserData = useCallback(async (): Promise<UserData | undefined> => {
    if (currentAddress) {
      const userData = await getUserDataOrCrateNew(currentAddress);
      return userData;
    }
    return undefined;
  }, [currentAddress]);

  const updateGlobalUserData = useCallback(() => {
    return getUserData()
      .then((userData: UserData | undefined) => {
        if (userData) {
          setUserData(userData);
        }
      })
      .catch(() => {
        console.warn("could not update global user data");
      });
  }, [getUserData]);

  useEffect(() => {
    if (currentAddress) {
      const getUserDataRequest = createCancellablePromise(
        Promise.all([getAllUsersVote(), getUserData()])
      );

      getUserDataRequest.promise
        .then(([usersVote, userData]: [UsersVote, UserData | undefined]) => {
          if (usersVote && Object.keys(usersVote).length !== 0) {
            const calculatedUsersVote: CalculatedUserVote =
              calculateVoteByUsers(usersVote);

            setCalculatedUsersVote(calculatedUsersVote);
            setUsersVote(usersVote);
          }
          if (userData) {
            setUserData(userData);
          }
        })
        .catch(() => {
          console.warn("could not fulfill userDataRequest");
        });
      return getUserDataRequest.cancel;
    }
  }, [currentAddress, getUserData]);

  return (
    <GraphContext.Provider
      value={{
        userData,
        usersVote,
        calculatedUsersVote,
        getUserNfts,
        getUserLending,
        getUsersLending: getAlllending,
        getUserRenting,
        getUserData,
        updateGlobalUserData,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
