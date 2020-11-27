import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { AbiItem } from "web3-utils";
import { Contract } from "web3-eth-contract";

import DappContext from "./Dapp";
import { Address, PaymentToken, Optional, Nft, OpenSeaNft } from "../types";
import { MAX_UINT256, ZERO_ADDRESS } from "../constants";
import { abis as genericAbis } from "../contracts";
import { THROWS } from "../utils";
import BN from "bn.js";

type ContractsContextType = {
  helpers: {
    // todo: need to resolve this
    fetchOpenSeaNfts: (owner: Address) => Promise<void>;
    setExternalNftAddresses: (addresses: Address[]) => void;
    fetchExternalNfts: () => Promise<void>;
    // if open sea does not fetch all the required NFTs,
    // users are free to set the addresses themselves
    externalNftAddresses?: Address[];
    // these are the resolved nfts that the user owns from the addresses
    // above
    externalNfts: Nft[];
    nfts: Nft[];
  };
  erc20: {
    contract: (at: Address) => Optional<Contract>;
    approve: (at: Address, operator: Address, amount?: string) => void;
    isApproved: (
      at: Address,
      operator: Address,
      amount: string
    ) => Promise<boolean>;
  };
  erc721: {
    contract: (at: Address) => Optional<Contract>;
    approve: (at: Address, operator: Address, tokenId?: string) => void;
    isApproved: (
      at: Address,
      operator: Address,
      tokenId?: string
    ) => Promise<boolean>;
  };
  face: {
    contract?: Contract;
    isApproved: (tokenId: string) => Promise<boolean>;
    approve: (tokenId: string) => void;
    approveAll: () => void;
  };
  rent: {
    contract?: Contract;
    lendOne: (
      nftAddress: Address,
      tokenId: string,
      maxRentDuration: string,
      dailyRentPrice: string,
      nftPrice: string,
      paymentToken: PaymentToken,
      gasSponsor?: Address
    ) => void;
    lendMultiple: (
      nftAddresses: Address[],
      tokenIds: string[],
      maxRentDurations: string[],
      dailyRentPrices: string[],
      nftPrices: string[],
      paymentTokens: PaymentToken[],
      gasSponsors?: Address[]
    ) => void;
    rentOne: (
      nftAddress: Address,
      tokenId: string,
      lendingShortId: string,
      lendingLongId: string,
      rentDuration: string,
      gasSponsor?: Address
    ) => void;
    rentMultiple: (
      nftAddresses: Address[],
      tokenIds: string[],
      lendingShortIds: string[],
      lendingLongIds: string[],
      rentDurations: string[],
      gasSponsors?: Address[]
    ) => void;
    returnOne: (
      nftAddress: Address,
      tokenId: string,
      lendingShortId: string,
      lendingLongId: string,
      gasSponsor?: Address
    ) => void;
    returnMultiple: (
      nftAddresses: Address[],
      tokenIds: string[],
      lendingShortIds: string[],
      lendingLongIds: string[],
      gasSponsors?: Address[]
    ) => void;
    claimCollateralOne: (
      nftAddress: Address,
      tokenId: string,
      lendingShortId: string,
      lendingLongId: string,
      gasSponsor?: Address
    ) => void;
    claimCollateralMultiple: (
      nftAddresses: Address[],
      tokenIds: string[],
      lendingShortIds: string[],
      lendingLongIds: string[],
      gasSponsors?: Address[]
    ) => void;
    stopLendingOne: (
      nftAddress: Address,
      tokenId: string,
      lendingShortId: string,
      lendingLongId: string,
      gasSponsor?: Address
    ) => void;
    stopLendingMultiple: (
      nftAddresses: Address[],
      tokenIds: string[],
      lendingShortIds: string[],
      lendingLongIds: string[],
      gasSponsors?: Address[]
    ) => void;
  };
};

const DefaultContractsContext = {
  helpers: {
    fetchOpenSeaNfts: async () => {
      console.error("must be implemented");
      return;
    },
    setExternalNftAddresses: THROWS,
    fetchExternalNfts: async () => {
      console.error("must be implemented");
      return;
    },
    nfts: [],
    externalNfts: [],
  },
  erc20: {
    contract: () => {
      console.error("must be implemented");
      return undefined;
    },
    approve: THROWS,
    isApproved: async () => {
      console.error("must be implemented");
      return false;
    },
  },
  erc721: {
    contract: () => {
      console.error("must be implemented");
      return undefined;
    },
    approve: THROWS,
    isApproved: async () => {
      console.error("must be implemented");
      return false;
    },
  },
  face: {
    isApproved: async () => {
      console.error("must be implemented");
      return false;
    },
    approve: THROWS,
    approveAll: THROWS,
  },
  rent: {
    lendOne: THROWS,
    lendMultiple: THROWS,
    rentOne: THROWS,
    rentMultiple: THROWS,
    returnOne: THROWS,
    returnMultiple: THROWS,
    claimCollateralOne: THROWS,
    claimCollateralMultiple: THROWS,
    stopLendingOne: THROWS,
    stopLendingMultiple: THROWS,
  },
};

const ContractsContext = createContext<ContractsContextType>(
  DefaultContractsContext
);

type ContractsProviderProps = {
  children: React.ReactNode;
};

export const ContractsProvider: React.FC<ContractsProviderProps> = ({
  children,
}) => {
  const { web3, wallet, addresses, abis } = useContext(DappContext);
  const [face, setFace] = useState<Contract>();
  const [rent, setRent] = useState<Contract>();
  const [nftAddresses, setNftAddresses] = useState<Set<Address>>(new Set());
  const [externalNfts, setExternalNfts] = useState<Nft[]>([]);
  const [nfts, setNfts] = useState<Nft[]>([]);

  const getContract = useCallback(
    (abi: AbiItem, address: Address): Optional<Contract> => {
      if (!web3) return;
      const contract = new web3.eth.Contract(abi, address);
      return contract;
    },
    [web3]
  );

  const getRentContract = useCallback(async () => {
    if (!abis?.rent || !addresses?.rent) return;

    const contract = getContract(abis.rent, addresses.rent);
    if (!contract) return;

    setRent(contract);
  }, [getContract, abis?.rent, addresses?.rent]);

  // --------------------------- Helpers ----------------------------
  // todo: right now this will be called each time the useEffect is triggered
  // in Lend. This is poor performance. Improve in the future
  const fetchOpenSeaNfts = useCallback(async (owner: Address) => {
    // todo: remove the limit + add load more
    try {
      const response = await fetch(
        `https://api.opensea.io/api/v1/assets?owner=${owner}&order_direction=desc&offset=0&limit=20`,
        {
          method: "GET",
          headers: {},
        }
      );
      const { assets }: { assets: OpenSeaNft[] } = await response.json();
      const resolved = resolveOpenSeaNfts(assets);
      setNfts(resolved);
    } catch (err) {
      console.error("could not fetch the opensea nfts");
      return;
    }
  }, []);

  const resolveOpenSeaNfts = (_nfts: OpenSeaNft[]) => {
    const resolved: Nft[] = _nfts.map((nft) => ({
      nftAddress: nft.asset_contract.address,
      tokenId: nft.token_id,
      imageUrl: nft.image_url,
    }));
    return resolved;
  };

  const setExternalNftAddresses = useCallback((addresses: Address[]) => {
    setNftAddresses((prev) => {
      const newAddresses = new Set(prev);
      for (const address of addresses) {
        newAddresses.add(address);
      }
      return newAddresses;
    });
  }, []);

  // uses the addresses from the external nft addresses set
  // and calls the NFT contracts directly to figure out which
  // token ids the user owns, and fetches those. This is a very
  // costly function
  const fetchExternalNfts = useCallback(async () => {
    // todo
    // setExternalNfts(...);
    return;
  }, []);
  // ----------------------------------------------------------------

  // --------------------------- Face -------------------------------
  const getFaceContract = useCallback(async () => {
    if (!abis?.face || !addresses?.face) return;

    const contract = getContract(abis.face, addresses.face);
    if (!contract) return;

    setFace(contract);
  }, [getContract, addresses?.face, abis?.face]);

  const approveAllFace = useCallback(async () => {
    if (!web3 || !wallet?.account || !addresses?.rent || !face?.methods) return;
    await face?.methods
      .setApprovalForAll(addresses?.rent, true)
      .send({ from: wallet?.account });
  }, [face, web3, wallet?.account, addresses?.rent]);

  const approveFace = useCallback(
    async (tokenId: string) => {
      if (!web3 || !wallet?.account || !addresses?.rent || !face?.methods)
        return;
      await face?.methods
        .approve(addresses?.rent, tokenId)
        .send({ from: wallet?.account });
    },
    [face, web3, wallet?.account, addresses?.rent]
  );

  const _isApprovedFace = useCallback(
    async (tokenId: string) => {
      const account = await face?.methods.getApproved(tokenId).call();
      return account.toLowerCase() === addresses?.rent.toLowerCase();
    },
    [face, addresses?.rent]
  );

  const isApprovedFace = useCallback(
    async (tokenId: string) => {
      let itIs = await face?.methods
        .isApprovedForAll(wallet?.account, addresses?.rent)
        .call();
      if (itIs) return true;
      itIs = await _isApprovedFace(tokenId);
      return itIs;
    },
    [face?.methods, wallet?.account, addresses?.rent, _isApprovedFace]
  );
  // ----------------------------------------------------------------

  // --------------------------- Rent -------------------------------
  const rentOne = useCallback(
    async (
      nftAddress: Address,
      tokenId: string,
      id: string,
      rentDuration: string,
      gasSponsor?: Address
    ) => {
      await rent?.methods
        .rentOne(
          nftAddress,
          tokenId,
          id,
          rentDuration,
          // ZERO_ADDRESS untested here
          gasSponsor || addresses?.rent || ZERO_ADDRESS
        )
        .send({ from: wallet?.account });
    },
    [rent, wallet?.account, addresses?.rent]
  );

  const rentMultiple = useCallback(
    async (
      nftAddresses: Address[],
      tokenIds: string[],
      ids: string[],
      rentDurations: string[],
      gasSponsors?: Address[]
    ) => {
      await rent?.methods
        .rentMultiple(
          nftAddresses,
          tokenIds,
          ids,
          rentDurations,
          gasSponsors ||
            Array(ids?.length).fill(addresses?.rent) ||
            Array(ids?.length).fill(ZERO_ADDRESS)
        )
        .send({ from: wallet?.account });
    },
    [rent, wallet?.account, addresses?.rent]
  );

  const lendOne = useCallback(
    async (
      nftAddress: Address,
      tokenId: string,
      maxRentDuration: string,
      dailyRentPrice: string,
      nftPrice: string,
      paymentToken: PaymentToken,
      gasSponsor?: Address
    ) => {
      await rent?.methods
        .lendOne(
          nftAddress,
          tokenId,
          maxRentDuration,
          dailyRentPrice,
          nftPrice,
          paymentToken,
          gasSponsor || addresses?.rent || ZERO_ADDRESS
        )
        .send({ from: wallet?.account });
    },
    [rent, wallet?.account, addresses?.rent]
  );

  const lendMultiple = useCallback(
    async (
      nftAddresses: Address[],
      tokenIds: string[],
      maxRentDurations: string[],
      dailyRentPrices: string[],
      nftPrices: string[],
      paymentTokens: PaymentToken[],
      gasSponsors?: Address[]
    ) => {
      await rent?.methods
        .lendMuliple(
          nftAddresses,
          tokenIds,
          maxRentDurations,
          dailyRentPrices,
          nftPrices,
          paymentTokens,
          gasSponsors ||
            Array(tokenIds?.length).fill(addresses?.rent) ||
            Array(tokenIds?.length).fill(ZERO_ADDRESS)
        )
        .send({ from: wallet?.account });
    },
    [wallet?.account, rent, addresses?.rent]
  );

  const returnOne = useCallback(
    async (
      nftAddress: Address,
      tokenId: string,
      id: string,
      gasSponsor?: Address
    ) => {
      await rent?.methods
        .returnOne(
          nftAddress,
          tokenId,
          id,
          gasSponsor || addresses?.rent || ZERO_ADDRESS
        )
        .send({ from: wallet?.account });
    },
    [wallet?.account, rent, addresses?.rent]
  );

  const returnMultiple = useCallback(
    async (
      nftAddresses: Address[],
      tokenIds: string[],
      ids: string[],
      gasSponsors?: Address[]
    ) => {
      await rent?.methods
        .returnMultiple(
          nftAddresses,
          tokenIds,
          ids,
          gasSponsors ||
            Array(tokenIds?.length).fill(addresses?.rent) ||
            Array(tokenIds?.length).fill(ZERO_ADDRESS)
        )
        .send({ from: wallet?.account });
    },
    [wallet?.account, rent, addresses?.rent]
  );

  const claimCollateralOne = useCallback(
    async (
      nftAddress: Address,
      tokenId: string,
      id: string,
      gasSponsor?: Address
    ) => {
      await rent?.methods
        .claimCollateralOne(
          nftAddress,
          tokenId,
          id,
          gasSponsor || addresses?.rent || ZERO_ADDRESS
        )
        .send({ from: wallet?.account });
    },
    [wallet?.account, rent, addresses?.rent]
  );

  const claimCollateralMultiple = useCallback(
    async (
      nftAddresses: Address[],
      tokenIds: string[],
      ids: string[],
      gasSponsors?: Address[]
    ) => {
      await rent?.methods
        .claimCollateralMultiple(
          nftAddresses,
          tokenIds,
          ids,
          gasSponsors ||
            Array(tokenIds?.length).fill(addresses?.rent) ||
            Array(tokenIds?.length).fill(ZERO_ADDRESS)
        )
        .send({ from: wallet?.account });
    },
    [wallet?.account, rent, addresses?.rent]
  );

  const stopLendingOne = useCallback(
    async (
      nftAddress: Address,
      tokenId: string,
      id: string,
      gasSponsor?: Address
    ) => {
      await rent?.methods
        .stopLendingOne(
          nftAddress,
          tokenId,
          id,
          gasSponsor || addresses?.rent || ZERO_ADDRESS
        )
        .send({ from: wallet?.account });
    },
    [wallet?.account, rent, addresses?.rent]
  );

  const stopLendingMultiple = useCallback(
    async (
      nftAddresses: Address[],
      tokenIds: string[],
      ids: string[],
      gasSponsors?: Address[]
    ) => {
      await rent?.methods
        .stopLendingMultiple(
          nftAddresses,
          tokenIds,
          ids,
          gasSponsors ||
            Array(tokenIds?.length).fill(addresses?.rent) ||
            Array(tokenIds?.length).fill(ZERO_ADDRESS)
        )
        .send({ from: wallet?.account });
    },
    [wallet?.account, rent, addresses?.rent]
  );

  // ---------------------------------------------------------------

  // --------------------------- ERC20 -------------------------------
  const getContractErc20 = useCallback(
    (at: Address) => {
      const contract = getContract(genericAbis.erc20, at);
      return contract;
    },
    [getContract]
  );

  const approveErc20 = useCallback(
    async (at: Address, operator: Address, amount?: string) => {
      const contract = getContractErc20(at);
      if (!contract) {
        console.info("could not get erc20 contract");
        return;
      }

      await contract.methods
        .approve(operator, amount || MAX_UINT256)
        .send({ from: wallet?.account });
    },
    [wallet?.account, getContractErc20]
  );

  const isApprovedErc20 = useCallback(
    async (at: Address, operator: Address, amount?: string) => {
      const contract = getContractErc20(at);
      if (!contract) {
        console.info("could not get erc20 contract");
        return false;
      }

      const allowance: BN = await contract.methods
        .allowance(operator)
        .call({ from: wallet?.account });

      if (!amount) return allowance.gte(MAX_UINT256);
      try {
        return allowance.gte(new BN(amount));
      } catch (err) {
        console.error("could not compare the numbers");
        return false;
      }
    },
    [wallet?.account, getContractErc20]
  );
  // ---------------------------------------------------------------

  // --------------------------- ERC721 -------------------------------
  const getContractErc721 = useCallback(
    (at: Address) => {
      const contract = getContract(genericAbis.erc721, at);
      return contract;
    },
    [getContract]
  );

  const approveErc721 = useCallback(
    async (at: Address, operator: Address, tokenId?: string) => {
      const contract = getContractErc721(at);
      if (!contract) {
        console.info("could not get erc721 contract");
        return;
      }

      if (tokenId) {
        await contract.methods
          .approve(operator, tokenId)
          .send({ from: wallet?.account });
      } else {
        await contract.methods
          .setApprovalForAll(operator, true)
          .send({ from: wallet?.account });
      }
    },
    [wallet?.account, getContractErc721]
  );

  const _isApprovedErc721 = useCallback(
    async (tokenId: string) => {
      const account = await face?.methods.getApproved(tokenId).call();
      return account.toLowerCase() === addresses?.rent.toLowerCase();
    },
    [face, addresses?.rent]
  );

  const isApprovedErc721 = useCallback(
    async (at: Address, operator: Address, tokenId?: string) => {
      const contract = getContractErc721(at);
      if (!contract) {
        console.info("could not get erc721 contract");
        return;
      }

      let itIs = await contract?.methods
        .isApprovedForAll(wallet?.account, operator)
        .call();
      if (itIs) return true;
      if (!tokenId) return false;
      itIs = await _isApprovedErc721(tokenId);
      return itIs;
    },
    [wallet?.account, getContractErc721, _isApprovedErc721]
  );
  // ---------------------------------------------------------------

  const getAllContracts = useCallback(async () => {
    await Promise.all([getFaceContract(), getRentContract()]);
    // * all contracts should be re-fetched when network or an account change
  }, [getFaceContract, getRentContract]);

  useEffect(() => {
    getAllContracts();
  }, [getAllContracts, wallet?.networkName, wallet?.account]);

  return (
    <ContractsContext.Provider
      value={{
        helpers: {
          fetchOpenSeaNfts,
          setExternalNftAddresses,
          fetchExternalNfts,
          // ? is thi OK
          externalNftAddresses: Array.from(nftAddresses.values()),
          externalNfts,
          nfts,
        },
        face: {
          contract: face,
          isApproved: isApprovedFace,
          approve: approveFace,
          approveAll: approveAllFace,
        },
        erc20: {
          contract: getContractErc20,
          approve: approveErc20,
          isApproved: isApprovedErc20,
        },
        erc721: {
          contract: getContractErc721,
          isApproved: isApprovedErc721,
          approve: approveErc721,
        },
        rent: {
          contract: rent,
          lendOne,
          rentOne,
          rentMultiple,
          lendMultiple,
          returnOne,
          returnMultiple,
          stopLendingOne,
          stopLendingMultiple,
          claimCollateralOne,
          claimCollateralMultiple,
        },
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
};

export default ContractsContext;
